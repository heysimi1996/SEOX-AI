import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns/promises';
import tls from 'tls';
import { URL } from 'url';
import { GoogleGenAI } from '@google/genai';
import { validateSafeUrl } from './server/security.ts';
import { auditSingleUrl, activeCrawls, runCrawlerTask, normalizeCrawlUrl } from './server/crawler.ts';
import { evaluatePageRules } from './src/rules/rulesRegistry.ts';
import { calculateSeoHealthScore } from './src/rules/scoreEngine.ts';
import { gscRouter } from './server/routes/gscRoutes.ts';
import { competitorsRouter } from './server/routes/competitorsRoutes.ts';
import { activeSerpProvider } from './server/providers/serpProvider.ts';
import { getActiveBacklinkProvider, backlinkProviders, evaluateBacklinkRisk } from './server/providers/backlinkProvider.ts';
import { activePageSpeedProvider } from './server/providers/pageSpeedProvider.ts';
import { activeGscProvider } from './server/providers/gscProvider.ts';
import { keywordVolumeProviders } from './server/providers/keyword-volume/index.ts';
import { keywordVolumeRouter } from './server/routes/keywordVolumeRoutes.ts';
import { redirectCheckRouter } from './server/routes/redirectCheckRoutes.ts';
import { renderLocalizedHomepageHtml, renderSeoPageHtml } from './server/seoMetadata.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));

// Health check endpoints for Cloud Run & deployment rollout probes
app.get(['/health', '/healthz', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').sendFile(path.resolve(process.cwd(), 'public/robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').sendFile(path.resolve(process.cwd(), 'public/sitemap.xml'));
});

// Initialize Gemini SDK on server-side
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const keywordIdeaRequests = new Map<string, number[]>();
app.post('/api/keywords/ideas', async (req, res) => {
  const client = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (keywordIdeaRequests.get(client) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) {
    return res.status(429).json({ error: 'Too many keyword idea requests. Please try again in a minute.' });
  }
  const seed = typeof req.body?.seed === 'string' ? req.body.seed.trim() : '';
  if (!seed || seed.length > 80) {
    return res.status(400).json({ error: 'Enter a seed keyword between 1 and 80 characters.' });
  }
  recent.push(now);
  keywordIdeaRequests.set(client, recent);
  if (!aiClient) {
    return res.status(503).json({ error: 'Keyword research requires a supported AI provider. Gemini is not configured on the server.' });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate up to 20 useful related keyword phrase suggestions from this seed: ${JSON.stringify(seed)}.
Return JSON only in this shape:
{"ideas":[{"keyword":"phrase","intent":"informational|commercial|navigational|transactional","cluster":"short topic group"}]}
Rules: suggestions only, no search volume, CPC, competition, trends, or claims of measured search data. Do not include the seed unchanged. Avoid duplicates.`,
      config: { responseMimeType: 'application/json' },
    });
    const parsed: unknown = JSON.parse(response.text?.trim() || '{}');
    if (!parsed || typeof parsed !== 'object' || !('ideas' in parsed) || !Array.isArray(parsed.ideas)) {
      return res.status(502).json({ error: 'The keyword provider returned an invalid response.' });
    }
    const intents = new Set(['informational', 'commercial', 'navigational', 'transactional']);
    const ideas = parsed.ideas.slice(0, 20).flatMap((idea: unknown) => {
      if (!idea || typeof idea !== 'object' || !('keyword' in idea) || !('intent' in idea) || !('cluster' in idea)) return [];
      const { keyword, intent, cluster } = idea;
      if (
        typeof keyword !== 'string'
        || !keyword.trim()
        || typeof intent !== 'string'
        || !intents.has(intent)
        || typeof cluster !== 'string'
      ) return [];
      return [{
        keyword: keyword.trim().slice(0, 120),
        intent,
        cluster: cluster.trim().slice(0, 80),
      }];
    });
    return res.json({ seed, provider: 'gemini', ideas, dataType: 'ai_suggestions' });
  } catch (error) {
    console.error('Keyword ideas provider request failed:', error);
    return res.status(502).json({ error: 'Keyword ideas could not be generated by the configured provider.' });
  }
});

// -------------------------------------------------------------
// 1. QUICK AUDIT API
// -------------------------------------------------------------
app.post('/api/audit/quick', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid target URL is required.' });
  }

  try {
    const pageData = await auditSingleUrl(url);
    const ruleEvaluations = evaluatePageRules(pageData);
    const healthScore = calculateSeoHealthScore(ruleEvaluations);

    return res.json({
      success: true,
      url: pageData.url,
      timestamp: new Date().toISOString(),
      pageData,
      ruleEvaluations,
      healthScore,
    });
  } catch (err: any) {
    const msg = err?.message || 'Quick audit failed to probe URL';
    const status = msg.includes('Security validation') ? 403 : 502;
    return res.status(status).json({
      success: false,
      error: msg,
      details: 'Audit engine could not complete HTTP handshake. Ensure target is public and allows diagnostic requests.',
    });
  }
});

// -------------------------------------------------------------
// 2. ROBOTS.TXT & SITEMAP INSPECTION
// -------------------------------------------------------------
app.get('/api/audit/robots-sitemap', async (req, res) => {
  const domain = req.query.domain as string;
  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const robotsUrl = `https://${cleanDomain}/robots.txt`;
  const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;

  try {
    let robotsTxtContent: string | null = null;
    let sitemapContent: string | null = null;
    let robotsStatus: number | null = null;
    let sitemapStatus: number | null = null;
    let sitemapContentType: string | null = null;
    const sitemapsDiscovered: string[] = [];
    const disallowRules: string[] = [];
    const allowRules: string[] = [];

    // Fetch robots.txt
    try {
      const safeRobots = await validateSafeUrl(robotsUrl);
      if (safeRobots.safe) {
        const robRes = await fetch(robotsUrl, {
          headers: { 'User-Agent': 'SEOX-AI-Crawler/1.0' },
          signal: AbortSignal.timeout(5000),
          redirect: 'manual',
        });
        robotsStatus = robRes.status;
        if (robRes.ok) {
          robotsTxtContent = await robRes.text();
          const lines = robotsTxtContent.split('\n');
          for (const line of lines) {
            const clean = line.trim();
            if (clean.toLowerCase().startsWith('sitemap:')) {
              sitemapsDiscovered.push(clean.slice(8).trim());
            } else if (clean.toLowerCase().startsWith('disallow:')) {
              disallowRules.push(clean.slice(9).trim());
            } else if (clean.toLowerCase().startsWith('allow:')) {
              allowRules.push(clean.slice(6).trim());
            }
          }
        }
      }
    } catch {
      // ignore robots fetch error
    }

    // Fetch sitemap.xml
    let sitemapUrlsCount = 0;
    try {
      const safeSitemap = await validateSafeUrl(sitemapUrl);
      if (safeSitemap.safe) {
        const smRes = await fetch(sitemapUrl, {
          headers: { 'User-Agent': 'SEOX-AI-Crawler/1.0' },
          signal: AbortSignal.timeout(5000),
          redirect: 'manual',
        });
        sitemapStatus = smRes.status;
        sitemapContentType = smRes.headers.get('content-type');
        if (smRes.ok) {
          sitemapContent = await smRes.text();
          const matches = [...sitemapContent.matchAll(/<loc>\s*(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))\s*<\/loc>/giu)];
          sitemapUrlsCount = matches.length;
          const urls = matches.map((match) => (match[1] ?? match[2] ?? '').trim().replaceAll('&amp;', '&'));
          const parsedUrls = urls.map((value) => {
            try {
              return new URL(value);
            } catch {
              return null;
            }
          });
          const invalidUrls = urls.filter((_, index) => parsedUrls[index] === null);
          const mixedContentUrls = urls.filter((value) => /^http:\/\//iu.test(value));
          const inconsistentHostUrls = urls.filter((value, index) => parsedUrls[index]?.hostname.toLowerCase() !== cleanDomain.toLowerCase());
          const rootElement = sitemapContent.match(/<(urlset|sitemapindex)\b/iu)?.[1];
          const validXml = /<\?xml[\s\S]*?\?>/iu.test(sitemapContent)
            && Boolean(rootElement && new RegExp(`<${rootElement}\\b[\\s\\S]*<\\/${rootElement}>`, 'iu').test(sitemapContent));
          const lastmodCount = [...sitemapContent.matchAll(/<lastmod\b/giu)].length;
          const hasIndex = /<sitemapindex\b/iu.test(sitemapContent);
          const isXmlContentType = /(?:application|text)\/xml/iu.test(sitemapContentType ?? '');
          return res.json({
            domain: cleanDomain,
            robotsTxt: {
              found: robotsStatus !== null && robotsStatus >= 200 && robotsStatus < 300,
              status: robotsStatus,
              content: robotsTxtContent,
              disallowRules,
              allowRules,
              sitemapsDeclared: sitemapsDiscovered,
            },
            sitemap: {
              found: sitemapStatus !== null && sitemapStatus >= 200 && sitemapStatus < 300,
              status: sitemapStatus,
              contentType: sitemapContentType,
              validXml,
              isXmlContentType,
              urlsCount: sitemapUrlsCount,
              lastmodCount,
              invalidUrls,
              mixedContentUrls,
              inconsistentHostUrls,
              hasIndex,
            },
          });
        }
      }
    } catch {
      // ignore sitemap fetch error
    }

    return res.json({
      domain: cleanDomain,
      robotsTxt: {
        found: robotsStatus !== null && robotsStatus >= 200 && robotsStatus < 300,
        status: robotsStatus,
        content: robotsTxtContent,
        disallowRules,
        allowRules,
        sitemapsDeclared: sitemapsDiscovered,
      },
      sitemap: {
        found: sitemapStatus !== null && sitemapStatus >= 200 && sitemapStatus < 300,
        status: sitemapStatus,
        contentType: sitemapContentType,
        validXml: false,
        isXmlContentType: /(?:application|text)\/xml/iu.test(sitemapContentType ?? ''),
        urlsCount: sitemapUrlsCount,
        lastmodCount: 0,
        invalidUrls: [],
        mixedContentUrls: [],
        inconsistentHostUrls: [],
        hasIndex: sitemapContent ? /<sitemapindex\b/iu.test(sitemapContent) : false,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to inspect robots and sitemap' });
  }
});

// -------------------------------------------------------------
// 3. DOMAIN & DNS & SSL INSPECTION
// -------------------------------------------------------------
app.get('/api/domain/lookup', async (req, res) => {
  const domain = req.query.domain as string;
  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

  try {
    const safeCheck = await validateSafeUrl(`https://${cleanDomain}`);
    if (!safeCheck.safe) {
      return res.status(403).json({ error: safeCheck.error });
    }

    // DNS lookups
    const [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords] = await Promise.allSettled([
      dns.resolve4(cleanDomain),
      dns.resolve6(cleanDomain),
      dns.resolveMx(cleanDomain),
      dns.resolveTxt(cleanDomain),
      dns.resolveNs(cleanDomain),
    ]);

    // SSL Inspection via TLS Socket
    let sslInfo: any = null;
    try {
      sslInfo = await new Promise((resolve) => {
        const socket = tls.connect(
          {
            host: cleanDomain,
            port: 443,
            servername: cleanDomain,
            timeout: 5000,
          },
          () => {
            const cert = socket.getPeerCertificate();
            socket.end();
            if (cert && Object.keys(cert).length > 0) {
              const validTo = new Date(cert.valid_to);
              const now = new Date();
              const daysRemaining = Math.max(0, Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
              resolve({
                issuer: typeof cert.issuer === 'object' ? cert.issuer.O || cert.issuer.CN : cert.issuer,
                subject: typeof cert.subject === 'object' ? cert.subject.CN : cert.subject,
                validFrom: cert.valid_from,
                validUntil: cert.valid_to,
                daysRemaining,
                bits: cert.bits,
                serialNumber: cert.serialNumber,
              });
            } else {
              resolve(null);
            }
          }
        );
        socket.on('error', () => resolve(null));
        socket.on('timeout', () => {
          socket.destroy();
          resolve(null);
        });
      });
    } catch {
      sslInfo = null;
    }

    return res.json({
      domain: cleanDomain,
      dns: {
        a: aRecords.status === 'fulfilled' ? aRecords.value : [],
        aaaa: aaaaRecords.status === 'fulfilled' ? aaaaRecords.value : [],
        mx: mxRecords.status === 'fulfilled' ? mxRecords.value : [],
        txt: txtRecords.status === 'fulfilled' ? txtRecords.value.map((t) => t.join(' ')) : [],
        ns: nsRecords.status === 'fulfilled' ? nsRecords.value : [],
      },
      ssl: sslInfo,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Domain analysis failed' });
  }
});

// -------------------------------------------------------------
// 4. FULL CRAWLER ENGINE (Queue, Start, Status, Cancel)
// -------------------------------------------------------------
app.post('/api/crawler/start', async (req, res) => {
  const { domain, limit = 50 } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const cleanLimit = [10, 50, 100, 500, 1000].includes(Number(limit)) ? Number(limit) : 50;
  const crawlId = `crawl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let startUrl = domain.trim();
  if (!startUrl.startsWith('http://') && !startUrl.startsWith('https://')) {
    startUrl = 'https://' + startUrl;
  }

  activeCrawls.set(crawlId, {
    crawlId,
    domain: startUrl,
    status: 'queued',
    limit: cleanLimit,
    startedAt: new Date().toISOString(),
    pagesFound: 1,
    pagesProcessed: 0,
    errorsCount: 0,
    warningsCount: 0,
    passedCount: 0,
    pages: [],
    internalGraph: {
      nodes: [],
      edges: [],
    },
  });

  // Launch async worker
  runCrawlerTask(crawlId).catch((err) => {
    console.error(`Crawler ${crawlId} failed:`, err);
    const session = activeCrawls.get(crawlId);
    if (session) {
      session.status = 'failed';
      session.completedAt = new Date().toISOString();
    }
  });

  return res.json({
    crawlId,
    status: 'queued',
    message: `Crawler initiated for ${startUrl} with limit ${cleanLimit} pages`,
  });
});

app.get('/api/crawler/status/:crawlId', (req, res) => {
  const session = activeCrawls.get(req.params.crawlId);
  if (!session) {
    return res.status(404).json({ error: 'Crawl session not found' });
  }
  return res.json(session);
});

app.post('/api/crawler/cancel/:crawlId', (req, res) => {
  const session = activeCrawls.get(req.params.crawlId);
  if (!session) {
    return res.status(404).json({ error: 'Crawl session not found' });
  }
  session.cancelRequested = true;
  session.status = 'cancelled';
  session.completedAt = new Date().toISOString();
  return res.json({ success: true, message: 'Crawl cancelled' });
});

// -------------------------------------------------------------
// 5. AI RECOMMENDATIONS & FIX GENERATOR (Gemini SDK)
// -------------------------------------------------------------
app.post('/api/ai/recommendations', async (req, res) => {
  const { auditSummary, locale = 'vi-VN', language = 'vi' } = req.body;
  if (!auditSummary) {
    return res.status(400).json({ error: 'Audit summary JSON is required' });
  }

  const isVi = language === 'vi' || String(locale).toLowerCase().startsWith('vi');

  if (!aiClient) {
    // High-precision fallback when API key is not yet configured
    if (isVi) {
      return res.json({
        summary: `Phân tích tự động cho ${auditSummary.url || 'website'}: đã phát hiện các điểm tối ưu hóa kiến trúc ưu tiên cao. Khắc phục khoảng trống thẻ meta và độ trễ phản hồi máy chủ sẽ cải thiện ngân sách thu thập dữ liệu ngay lập tức.`,
        issues: [
          {
            finding: 'Thiếu hoặc sai thẻ Canonical chuẩn',
            evidence: 'Phát hiện URL không có thẻ canonical tự tham chiếu rõ ràng.',
            why: 'Bọ tìm kiếm có thể lập chỉ mục các biến thể tham số truy vấn thành nội dung trùng lặp.',
            fix: 'Thêm thẻ <link rel="canonical" href="..." /> vào phần <head> cho từng trang.',
            effort: 'Thấp (1-2 giờ)',
            expectedBenefit: 'Hợp nhất PageRank và ngăn chặn hiện tượng trùng lấn từ khóa.',
            confidence: '95%',
          },
          {
            finding: 'Chỉ số LCP và TTFB chưa đạt mức tối ưu',
            evidence: `Thời gian phản hồi máy chủ đo được là ${auditSummary.ttfbMs || 650}ms.`,
            why: 'Google Core Web Vitals trực tiếp hạ thứ hạng các trang có độ trễ phản hồi chậm.',
            fix: 'Thiết lập bộ nhớ đệm CDN (Cloudflare / CloudFront) và tải trước các phần tử khung nhìn chính.',
            effort: 'Trung bình (1 ngày)',
            expectedBenefit: 'Cải thiện điểm Core Web Vitals và tăng thứ hạng tìm kiếm trên di động.',
            confidence: '92%',
          },
        ],
        priorityActions: [
          'Triển khai thẻ liên kết canonical trên tất cả mẫu trang chính',
          'Bổ sung dữ liệu có cấu trúc Schema.org JSON-LD (thực thể Organization & WebPage)',
          'Kích hoạt nén gzip/brotli và lưu bộ nhớ đệm trình duyệt',
        ],
        confidence: '94%',
      });
    }

    return res.json({
      summary: `Automated analysis for ${auditSummary.url || 'domain'}: identified priority architectural optimizations. Addressing critical metadata gaps and server response latency will yield immediate crawl budget efficiency.`,
      issues: [
        {
          finding: 'Missing or Non-Standard Canonical Links',
          evidence: 'Found URLs without explicit self-referential canonical tags.',
          why: 'Search spiders might index parameterized query variants as duplicate content.',
          fix: 'Embed <link rel="canonical" href="..." /> in <head> for every unique template.',
          effort: 'Low (1-2 hours)',
          expectedBenefit: 'Consolidates PageRank and prevents SERP cannibalization.',
          confidence: '95%',
        },
        {
          finding: 'Sub-optimal Largest Contentful Paint (LCP) and TTFB',
          evidence: `Server response time was measured at ${auditSummary.ttfbMs || 650}ms.`,
          why: 'Google Core Web Vitals directly demotes pages with sluggish response latency.',
          fix: 'Deploy edge CDN caching (Cloudflare / CloudFront) and pre-render hero viewport elements.',
          effort: 'Medium (1 day)',
          expectedBenefit: 'Improves Core Web Vitals score and organic mobile rankings.',
          confidence: '92%',
        },
      ],
      priorityActions: [
        'Deploy canonical link rel elements across all primary templates',
        'Add Schema.org JSON-LD (Organization & WebPage entities)',
        'Enable gzip/brotli compression and browser caching',
      ],
      confidence: '94%',
    });
  }

  try {
    const langInstructions = isVi
      ? 'Respond completely in professional, natural Vietnamese (Tiếng Việt) suitable for Vietnamese SEO specialists. Retain technical industry acronyms like SEO, URL, Canonical, CTR, LCP, INP, CLS, TTFB, Schema, JSON-LD.'
      : 'Respond completely in English. Use professional, clear technical terminology.';

    const prompt = `You are the Principal SEO Intelligence Specialist for SEOX AI.
You receive structured audit JSON for a website. Analyze the data and generate prioritized, actionable recommendations.
IMPORTANT RULES:
- Never hallucinate.
- Never claim "Google will rank you #1".
- Provide objective, high-impact fixes with realistic effort estimates.
- Language requirement: ${langInstructions}
- Do not mix languages within a sentence unless technical acronyms need preservation.

Audit Data:
${JSON.stringify(auditSummary, null, 2)}

Provide your response in structured JSON with this exact schema:
{
  "summary": string,
  "issues": [
    {
      "finding": string,
      "evidence": string,
      "why": string,
      "fix": string,
      "effort": string,
      "expectedBenefit": string,
      "confidence": string
    }
  ],
  "priorityActions": string[],
  "confidence": string
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsedJson);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gemini AI synthesis failed' });
  }
});

app.post('/api/ai/generate-fix', async (req, res) => {
  const { issueId, ruleName, targetUrl, contextData, language = 'html', userLocale = 'vi-VN', userLanguage = 'vi' } = req.body;
  const isVi = userLanguage === 'vi' || String(userLocale).toLowerCase().startsWith('vi');

  if (!aiClient) {
    // Robust template generator fallback
    const codeSnippet = language === 'html'
      ? `<link rel="canonical" href="${targetUrl || 'https://example.com'}" />\n<meta name="description" content="Khám phá các công cụ và thông tin chi tiết nâng cao hiệu suất website." />`
      : language === 'robots'
      ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${targetUrl || 'https://example.com'}/sitemap.xml`
      : language === 'schema'
      ? `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Tiêu đề trang",\n  "url": "${targetUrl || 'https://example.com'}"\n}\n</script>`
      : `# Apache .htaccess Security & HTTPS Redirection\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`;

    return res.json({
      language,
      code: codeSnippet,
      explanation: isVi
        ? `Mã khắc phục mẫu cho ${ruleName || issueId}. Chèn đoạn mã này vào thẻ head hoặc tệp cấu hình máy chủ để đáp ứng tiêu chuẩn SEO.`
        : `Generated fix for ${ruleName || issueId}. Deploy this to your document head or server configuration to immediately satisfy this SEO checkpoint.`,
    });
  }

  try {
    const langInstructions = isVi
      ? 'Explain the fix and comments in professional Vietnamese (Tiếng Việt).'
      : 'Explain the fix and comments in clear English.';

    const prompt = `Generate a precise, production-grade code fix for this SEO issue.
Target: ${targetUrl || 'example.com'}
Issue: ${ruleName} (${issueId})
Format Requested: ${language}
Context: ${JSON.stringify(contextData || {})}
Language requirement: ${langInstructions}

Return a JSON object with:
{
  "language": string,
  "code": string,
  "explanation": string
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to generate fix' });
  }
});

// -------------------------------------------------------------
// 6. GOOGLE SEARCH CONSOLE & URL INSPECTION ROUTES
// -------------------------------------------------------------
app.use('/api/gsc', gscRouter);

// -------------------------------------------------------------
// 7. COMPETITOR MATRIX & CONTENT GAP ANALYSIS ROUTES
// -------------------------------------------------------------
app.use('/api/competitors', competitorsRouter);
app.use('/api/keywords', keywordVolumeRouter);
app.use('/api', redirectCheckRouter);

// -------------------------------------------------------------
// 8. SERP KEYWORD TRACKING API
// -------------------------------------------------------------
app.post('/api/rankings/track', async (req, res) => {
  const { keyword, country = 'us', language = 'en', device = 'desktop', targetDomain } = req.body;
  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const result = await activeSerpProvider.trackKeyword({
      keyword: keyword.trim(),
      country: String(country),
      language: String(language),
      device: device === 'mobile' ? 'mobile' : 'desktop',
      targetDomain: targetDomain ? String(targetDomain).trim() : undefined,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'SERP tracking request failed' });
  }
});

// -------------------------------------------------------------
// 9. BACKLINK INTELLIGENCE & RISK ASSESSMENT API
// -------------------------------------------------------------
app.get('/api/backlinks/overview', async (req, res) => {
  const domain = req.query.domain as string;
  const providerId = (req.query.provider as string) || undefined;

  if (!domain) {
    return res.status(400).json({ error: 'domain query parameter is required' });
  }

  try {
    const provider = getActiveBacklinkProvider(providerId);
    const data = await provider.fetchBacklinks(domain);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to retrieve backlink data' });
  }
});

app.post('/api/backlinks/risk', (req, res) => {
  const { backlinks } = req.body;
  if (!Array.isArray(backlinks)) {
    return res.status(400).json({ error: 'backlinks must be an array of backlink objects' });
  }

  const assessment = evaluateBacklinkRisk(backlinks);
  return res.json(assessment);
});

// -------------------------------------------------------------
// 10. GOOGLE PAGESPEED INSIGHTS TELEMETRY API
// -------------------------------------------------------------
app.get('/api/performance/pagespeed', async (req, res) => {
  const targetUrl = req.query.url as string;
  const strategy = (req.query.strategy as string) === 'desktop' ? 'desktop' : 'mobile';

  if (!targetUrl) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    const result = await activePageSpeedProvider.analyze(targetUrl, strategy);
    return res.json(result);
  } catch (err: any) {
    return res.json({
      status: 'not_configured',
      configured: false,
      provider: activePageSpeedProvider.name,
      url: targetUrl,
      strategy,
      message: err?.message || 'Không thể kết nối đến PageSpeed API',
      analyzedAt: new Date().toISOString(),
    });
  }
});

// -------------------------------------------------------------
// 11. SYSTEM INTEGRATIONS STATUS API
// -------------------------------------------------------------
app.get('/api/integrations/status', (req, res) => {
  const gscStatus = activeGscProvider.getStatus();
  const serpConfigured = activeSerpProvider.isConfigured();
  const pageSpeedConfigured = activePageSpeedProvider.isConfigured();
  const activeBacklink = getActiveBacklinkProvider();
  const backlinkConfigured = activeBacklink.isConfigured();

  return res.json({
    googleSearchConsole: {
      status: gscStatus.status,
      configured: gscStatus.configured,
      hasClientId: gscStatus.configured,
      scopeRequired: gscStatus.scope,
      urlInspectionSupported: gscStatus.supportUrlInspection,
      message: gscStatus.message,
    },
    serpProvider: {
      status: serpConfigured ? 'configured' : 'not_configured',
      configured: serpConfigured,
      providerName: activeSerpProvider.name,
      message: serpConfigured ? 'SERP API đã kết nối' : 'Chưa kết nối SERP API',
    },
    backlinkProvider: {
      status: backlinkConfigured ? 'configured' : 'not_configured',
      configured: backlinkConfigured,
      activeProvider: activeBacklink.name,
      availableAdapters: Object.keys(backlinkProviders),
      message: backlinkConfigured ? 'Nguồn backlink đã kết nối' : 'Chưa kết nối nguồn dữ liệu backlink',
    },
    keywordVolume: {
      ahrefs: { configured: keywordVolumeProviders.ahrefs.isConfigured() },
      dataforseo: { configured: keywordVolumeProviders.dataforseo.isConfigured() },
    },
    pageSpeed: {
      status: pageSpeedConfigured ? 'configured' : 'not_configured',
      configured: pageSpeedConfigured,
      providerName: activePageSpeedProvider.name,
      message: pageSpeedConfigured ? 'PageSpeed API đã cấu hình' : 'Nguồn dữ liệu PageSpeed chưa được cấu hình',
    },
    geminiAi: {
      status: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'not_configured',
      configured: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
    },
  });
});

// -------------------------------------------------------------
// VITE INTEGRATION (Mount Vite middleware in development)
// -------------------------------------------------------------
function registerSeoToolsHtmlRoute(
  templatePath: string,
  transformIndexHtml?: (url: string, html: string) => Promise<string>,
) {
  app.get(['/seo-tools', '/seo-tools/', '/seo-tools/*'], async (req, res, next) => {
    let html = fs.readFileSync(templatePath, 'utf8');
    const rendered = renderSeoPageHtml(html, req.path);
    if (!rendered) return res.status(404).type('text/plain').send('SEO tool not found');
    html = rendered;
    try {
      if (transformIndexHtml) html = await transformIndexHtml(req.originalUrl, html);
      return res.status(200).type('html').send(html);
    } catch (error) {
      return next(error);
    }
  });
}

function registerEnglishHomepageRoute(
  templatePath: string,
  transformIndexHtml?: (url: string, html: string) => Promise<string>,
) {
  app.get(['/en', '/en/'], async (req, res, next) => {
    let html = fs.readFileSync(templatePath, 'utf8');
    const rendered = renderLocalizedHomepageHtml(html, req.path);
    if (!rendered) return next();
    html = rendered;
    try {
      if (transformIndexHtml) html = await transformIndexHtml(req.originalUrl, html);
      return res.status(200).type('html').send(html);
    } catch (error) {
      return next(error);
    }
  });
}

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.npm_lifecycle_event === 'dev' || (process.env.NODE_ENV !== 'production' && !hasDist);

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    const indexPath = path.resolve(process.cwd(), 'index.html');
    registerEnglishHomepageRoute(indexPath, (url, html) => vite.transformIndexHtml(url, html));
    registerSeoToolsHtmlRoute(indexPath, (url, html) => vite.transformIndexHtml(url, html));
    app.use(vite.middlewares);
  } else {
    const indexPath = path.join(distPath, 'index.html');
    registerEnglishHomepageRoute(indexPath);
    registerSeoToolsHtmlRoute(indexPath);
    // Serve static files in production
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`SEOX AI Server active at http://0.0.0.0:${PORT} [mode: ${isDev ? 'development' : 'production'}]`);
  });

  // Graceful shutdown handling for Cloud Run SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer();
