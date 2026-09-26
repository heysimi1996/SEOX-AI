import { validateSafeUrl } from './security.ts';
import * as cheerio from 'cheerio';
import type { PageAuditData } from '../src/rules/types.ts';
import { evaluatePageRules } from '../src/rules/rulesRegistry.ts';
import { calculateSeoHealthScore } from '../src/rules/scoreEngine.ts';

export interface CrawlSession {
  crawlId: string;
  domain: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  limit: number;
  startedAt: string;
  completedAt?: string;
  pagesFound: number;
  pagesProcessed: number;
  errorsCount: number;
  warningsCount: number;
  passedCount: number;
  pages: Array<{
    id: string;
    url: string;
    status: number;
    title: string | null;
    depth: number;
    responseTimeMs: number;
    score: number;
    issuesCount: number;
    data: PageAuditData;
  }>;
  internalGraph: {
    nodes: Array<{ id: string; url: string; depth: number; score: number; inDegree: number; outDegree: number; isOrphan: boolean }>;
    edges: Array<{ source: string; target: string; anchor: string }>;
  };
  cancelRequested?: boolean;
}

export const activeCrawls = new Map<string, CrawlSession>();

/**
 * Normalizes URL and strips hash fragments while preserving search queries if relevant.
 */
export function normalizeCrawlUrl(raw: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(raw, baseUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    parsed.hash = '';
    // Normalize trailing slash for root paths
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Extract comprehensive SEO data from an HTML page.
 */
export function parseHtmlPage(html: string, pageUrl: string, responseTimeMs: number, status: number, statusText: string, headers: Record<string, string>): PageAuditData {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(pageUrl);
  const hostname = parsedUrl.hostname;

  // Title & Metas
  const title = $('title').first().text().trim() || null;
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || null;
  const canonical = $('link[rel="canonical" i]').attr('href')?.trim() || null;
  const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || null;
  const viewport = $('meta[name="viewport" i]').attr('content')?.trim() || null;
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type" i]').attr('content') || 'utf-8';

  // Headings
  const headings = {
    h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h4: $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h5: $('h5').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h6: $('h6').map((_, el) => $(el).text().trim()).get().filter(Boolean),
  };

  // Word count & readable body text
  // Remove scripts, styles, svg
  $('script, style, noscript, svg, nav, footer, header').remove();
  const cleanBodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = cleanBodyText ? cleanBodyText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Reload $ for link/image inspection
  const $$ = cheerio.load(html);

  // Links
  const internalLinks: Array<{ href: string; anchor: string; nofollow: boolean }> = [];
  const externalLinks: Array<{ href: string; anchor: string; nofollow: boolean }> = [];

  $$('a[href]').each((_, el) => {
    const rawHref = $$(el).attr('href')?.trim();
    if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }

    const anchor = $$(el).text().trim() || $$(el).find('img').attr('alt')?.trim() || '';
    const rel = ($$(el).attr('rel') || '').toLowerCase();
    const nofollow = rel.includes('nofollow');

    try {
      const targetUrl = new URL(rawHref, pageUrl);
      if (targetUrl.hostname === hostname) {
        internalLinks.push({
          href: targetUrl.toString(),
          anchor,
          nofollow,
        });
      } else {
        externalLinks.push({
          href: targetUrl.toString(),
          anchor,
          nofollow,
        });
      }
    } catch {
      // ignore invalid URLs
    }
  });

  // Images
  const images: PageAuditData['images'] = [];
  $$('img').each((_, el) => {
    const src = $$(el).attr('src') || $$(el).attr('data-src') || '';
    if (!src) return;
    const alt = $$(el).attr('alt');
    const widthStr = $$(el).attr('width');
    const heightStr = $$(el).attr('height');
    const loading = $$(el).attr('loading');

    const isModern = src.endsWith('.webp') || src.endsWith('.avif') || src.endsWith('.svg');

    images.push({
      src,
      alt: alt ?? null,
      hasAlt: typeof alt === 'string' && alt.trim().length > 0,
      hasDimensions: Boolean(widthStr && heightStr),
      isModernFormat: isModern,
      width: widthStr ? parseInt(widthStr, 10) : undefined,
      height: heightStr ? parseInt(heightStr, 10) : undefined,
      loading,
    });
  });

  // Open Graph
  const openGraph: Record<string, string> = {};
  $$('meta[property^="og:" i]').each((_, el) => {
    const prop = $$(el).attr('property');
    const content = $$(el).attr('content');
    if (prop && content) openGraph[prop] = content;
  });

  // Twitter Card
  const twitterCard: Record<string, string> = {};
  $$('meta[name^="twitter:" i]').each((_, el) => {
    const name = $$(el).attr('name');
    const content = $$(el).attr('content');
    if (name && content) twitterCard[name] = content;
  });

  // Hreflang
  const hreflangs: Array<{ lang: string; href: string }> = [];
  $$('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $$(el).attr('hreflang') || '';
    const href = $$(el).attr('href') || '';
    if (lang && href) hreflangs.push({ lang, href });
  });

  // JSON-LD
  const jsonLd: PageAuditData['jsonLd'] = [];
  $$('script[type="application/ld+json"]').each((_, el) => {
    const raw = $$(el).html() || '';
    try {
      const parsed = JSON.parse(raw);
      const types: string[] = [];

      const extractTypes = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj['@type']) {
          if (Array.isArray(obj['@type'])) types.push(...obj['@type']);
          else types.push(obj['@type']);
        }
        if (Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(extractTypes);
        }
      };

      if (Array.isArray(parsed)) {
        parsed.forEach(extractTypes);
      } else {
        extractTypes(parsed);
      }

      jsonLd.push({
        raw,
        parsed,
        isValid: true,
        types: Array.from(new Set(types)),
      });
    } catch (err: any) {
      jsonLd.push({
        raw,
        parsed: null,
        isValid: false,
        types: [],
        error: err?.message || 'JSON-LD syntax error',
      });
    }
  });

  // Security Headers
  const securityHeaders = {
    strictTransportSecurity: headers['strict-transport-security'] || null,
    contentSecurityPolicy: headers['content-security-policy'] || null,
    xFrameOptions: headers['x-frame-options'] || null,
    xContentTypeOptions: headers['x-content-type-options'] || null,
    referrerPolicy: headers['referrer-policy'] || null,
    permissionsPolicy: headers['permissions-policy'] || null,
  };

  return {
    url: pageUrl,
    finalUrl: pageUrl,
    status,
    statusText,
    responseTimeMs,
    isHttps: parsedUrl.protocol === 'https:',
    contentType: headers['content-type'] || 'text/html',
    redirects: [],
    title,
    metaDescription,
    canonical,
    robotsMeta,
    viewport,
    charset,
    wordCount,
    readingTimeMin,
    headings,
    links: {
      internal: internalLinks,
      external: externalLinks,
      totalInternal: internalLinks.length,
      totalExternal: externalLinks.length,
    },
    images,
    openGraph,
    twitterCard,
    hreflangs,
    jsonLd,
    securityHeaders,
    performance: {
      ttfbMs: responseTimeMs,
      downloadTimeMs: Math.round(responseTimeMs * 0.3),
      contentLengthBytes: Buffer.byteLength(html, 'utf-8'),
    },
  };
}

/**
 * Execute real single page audit with SSRF protection and timeouts.
 */
export async function auditSingleUrl(targetUrl: string): Promise<PageAuditData> {
  const safeCheck = await validateSafeUrl(targetUrl);
  if (!safeCheck.safe) {
    throw new Error(`Security validation blocked URL: ${safeCheck.error}`);
  }

  const finalUrl = safeCheck.url.toString();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  const startTime = Date.now();
  try {
    const res = await fetch(finalUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SEOX-AI-Crawler/1.0 (+https://seox.ai/bot; diagnostic audit engine)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const responseTimeMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const headersObj: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headersObj[key.toLowerCase()] = val;
    });

    const html = await res.text();
    return parseHtmlPage(html, res.url || finalUrl, responseTimeMs, res.status, res.statusText, headersObj);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 7500ms when probing ${finalUrl}`);
    }
    throw err;
  }
}

/**
 * Asynchronous Crawler execution loop for full site crawls.
 */
export async function runCrawlerTask(crawlId: string) {
  const session = activeCrawls.get(crawlId);
  if (!session) return;

  session.status = 'running';
  const queue: Array<{ url: string; depth: number }> = [{ url: session.domain, depth: 0 }];
  const visited = new Set<string>();
  const pageScoresMap = new Map<string, number>();

  while (queue.length > 0 && session.pagesProcessed < session.limit) {
    if (session.cancelRequested) {
      session.status = 'cancelled';
      session.completedAt = new Date().toISOString();
      return;
    }

    const current = queue.shift()!;
    const normUrl = normalizeCrawlUrl(current.url, session.domain);
    if (!normUrl || visited.has(normUrl)) continue;

    visited.add(normUrl);

    try {
      const pageData = await auditSingleUrl(normUrl);
      const evaluations = evaluatePageRules(pageData);
      const health = calculateSeoHealthScore(evaluations);

      pageScoresMap.set(normUrl, health.score);

      session.pagesProcessed++;
      session.pagesFound = visited.size + queue.length;

      // Count issues
      const criticalCount = evaluations.filter((e) => !e.passed && e.rule.severity === 'critical').length;
      const warnCount = evaluations.filter((e) => !e.passed && (e.rule.severity === 'high' || e.rule.severity === 'medium')).length;
      const passedCount = evaluations.filter((e) => e.passed).length;

      session.errorsCount += criticalCount;
      session.warningsCount += warnCount;
      session.passedCount += passedCount;

      session.pages.push({
        id: `P-${session.pages.length + 1}`,
        url: normUrl,
        status: pageData.status,
        title: pageData.title,
        depth: current.depth,
        responseTimeMs: pageData.responseTimeMs,
        score: health.score,
        issuesCount: criticalCount + warnCount,
        data: pageData,
      });

      // Add newly discovered internal links to queue if within limit
      if (current.depth < 4 && queue.length + visited.size < session.limit * 2) {
        for (const link of pageData.links.internal) {
          const childNorm = normalizeCrawlUrl(link.href, session.domain);
          if (childNorm && !visited.has(childNorm) && !queue.some((q) => q.url === childNorm)) {
            queue.push({ url: childNorm, depth: current.depth + 1 });

            // Add edge to graph
            session.internalGraph.edges.push({
              source: normUrl,
              target: childNorm,
              anchor: link.anchor || '',
            });
          }
        }
      }

      // Small throttle to be courteous
      await new Promise((r) => setTimeout(r, 120));
    } catch (err: any) {
      session.errorsCount++;
      session.pagesProcessed++;
    }
  }

  // Construct internal link graph nodes with in/out degree
  const nodeMap = new Map<string, { inDegree: number; outDegree: number; depth: number }>();
  for (const page of session.pages) {
    nodeMap.set(page.url, { inDegree: 0, outDegree: 0, depth: page.depth });
  }

  for (const edge of session.internalGraph.edges) {
    const src = nodeMap.get(edge.source);
    if (src) src.outDegree++;
    const tgt = nodeMap.get(edge.target);
    if (tgt) tgt.inDegree++;
  }

  session.internalGraph.nodes = session.pages.map((p) => {
    const meta = nodeMap.get(p.url) || { inDegree: 0, outDegree: 0, depth: p.depth };
    return {
      id: p.id,
      url: p.url,
      depth: meta.depth,
      score: p.score,
      inDegree: meta.inDegree,
      outDegree: meta.outDegree,
      isOrphan: meta.inDegree === 0 && meta.depth > 0,
    };
  });

  session.status = 'completed';
  session.completedAt = new Date().toISOString();
}
