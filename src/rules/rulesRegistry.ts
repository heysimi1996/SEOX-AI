import type { SeoRule, RuleEvaluationResult, PageAuditData } from './types.ts';

export const SEO_RULES_REGISTRY: Record<string, SeoRule> = {
  'TECH-001': {
    id: 'TECH-001',
    name: 'HTTPS Encryption Enforcement',
    category: 'security',
    severity: 'critical',
    impact: 'critical',
    description: 'Ensure the page is served over secure HTTPS protocol and enforces transport layer security.',
    detection: 'Checks if target URL protocol is https and if HSTS headers are supplied.',
    recommendation: 'Configure an SSL/TLS certificate and enforce automatic 301 redirects from HTTP to HTTPS.',
    scoreImpact: 15,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/https',
  },
  'META-001': {
    id: 'META-001',
    name: 'Missing Page Title Tag',
    category: 'content',
    severity: 'critical',
    impact: 'critical',
    description: 'Title tag is missing or entirely empty in the document head.',
    detection: 'Evaluates document <head> for a valid, populated <title> element.',
    recommendation: 'Add a unique, informative <title> tag between 30 and 60 characters describing the page content.',
    scoreImpact: 14,
    documentation: 'https://developers.google.com/search/docs/appearance/title-link',
  },
  'META-002': {
    id: 'META-002',
    name: 'Duplicate or Non-Unique Title Tag',
    category: 'content',
    severity: 'high',
    impact: 'high',
    description: 'Page title is generic or matches default boilerplate across multiple site sections.',
    detection: 'Compares title text against common defaults and detects repetitive patterns.',
    recommendation: 'Create a distinctive title incorporating primary keyword and brand suffix.',
    scoreImpact: 8,
    documentation: 'https://developers.google.com/search/docs/appearance/title-link',
  },
  'META-003': {
    id: 'META-003',
    name: 'Suboptimal Title Length',
    category: 'content',
    severity: 'medium',
    impact: 'medium',
    description: 'Title tag length is under 20 characters or exceeds 65 characters, causing SERP truncation.',
    detection: 'Counts character length of the <title> tag.',
    recommendation: 'Keep title between 35 and 60 characters to optimize SERP pixel boundaries (approx 600px).',
    scoreImpact: 5,
    documentation: 'https://developers.google.com/search/docs/appearance/title-link',
  },
  'META-004': {
    id: 'META-004',
    name: 'Missing or Empty Meta Description',
    category: 'content',
    severity: 'high',
    impact: 'high',
    description: 'The meta description tag is absent or contains no text content.',
    detection: 'Scans for <meta name="description" content="..."> in head.',
    recommendation: 'Add an action-oriented meta description between 120 and 160 characters summarizing the page value.',
    scoreImpact: 8,
    documentation: 'https://developers.google.com/search/docs/appearance/snippets',
  },
  'CONTENT-001': {
    id: 'CONTENT-001',
    name: 'Thin Content Indicator',
    category: 'content',
    severity: 'high',
    impact: 'high',
    description: 'The extracted body text contains fewer than 300 words, risking low-quality categorization.',
    detection: 'Calculates clean body text word count excluding navigation, footer and script boilerplate.',
    recommendation: 'Expand content with comprehensive explanations, FAQs, and topic depth to satisfy user intent.',
    scoreImpact: 9,
    documentation: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
  },
  'LINK-001': {
    id: 'LINK-001',
    name: 'Broken Internal Links Detected',
    category: 'links',
    severity: 'critical',
    impact: 'critical',
    description: 'Internal anchor tags link to 404, 500, or non-functional endpoints.',
    detection: 'Validates status codes of discovered internal href references.',
    recommendation: 'Update or remove broken internal links to prevent crawl budget waste and bad user experience.',
    scoreImpact: 12,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/overview',
  },
  'LINK-002': {
    id: 'LINK-002',
    name: 'Orphan Page / Weak Link Equity Signal',
    category: 'links',
    severity: 'medium',
    impact: 'medium',
    description: 'Page has zero or very few incoming internal links from main navigation or category hubs.',
    detection: 'Evaluates incoming internal link graph and click depth from homepage.',
    recommendation: 'Add contextual internal links from relevant parent pages or related topic clusters.',
    scoreImpact: 6,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable',
  },
  'SCHEMA-001': {
    id: 'SCHEMA-001',
    name: 'Structured Data Missing or Invalid JSON-LD',
    category: 'schema',
    severity: 'high',
    impact: 'high',
    description: 'Page lacks Schema.org JSON-LD or contains syntax validation errors.',
    detection: 'Parses all <script type="application/ld+json"> blocks for validity and required entity types.',
    recommendation: 'Embed valid JSON-LD defining Schema types like WebPage, Organization, Article, or Product.',
    scoreImpact: 8,
    documentation: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
  },
  'INDEX-001': {
    id: 'INDEX-001',
    name: 'Noindex Directive Detected',
    category: 'indexability',
    severity: 'critical',
    impact: 'critical',
    description: 'Robots meta tag or X-Robots-Tag header contains "noindex", preventing search indexing.',
    detection: 'Checks robots meta tag content and HTTP headers for noindex token.',
    recommendation: 'Remove noindex directive if this page is intended to be indexed in organic search.',
    scoreImpact: 15,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/block-indexing',
  },
  'INDEX-002': {
    id: 'INDEX-002',
    name: 'Robots.txt Crawl Block Indicator',
    category: 'indexability',
    severity: 'high',
    impact: 'high',
    description: 'Robots.txt disallow rules may be obstructing crawler access to page or key assets.',
    detection: 'Tests page path against standard robots.txt disallow patterns.',
    recommendation: 'Review robots.txt to ensure essential CSS, JS, and content paths are allowed.',
    scoreImpact: 10,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
  },
  'CANON-001': {
    id: 'CANON-001',
    name: 'Missing or Non-Self Canonical Tag',
    category: 'technical',
    severity: 'medium',
    impact: 'medium',
    description: 'Canonical link tag is absent or points to a differing URL.',
    detection: 'Checks <link rel="canonical" href="..."> presence and compares with final target URL.',
    recommendation: 'Add a self-referential canonical tag to consolidate index authority.',
    scoreImpact: 6,
    documentation: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
  },
  'PERF-001': {
    id: 'PERF-001',
    name: 'Slow Server Response Time (TTFB > 600ms)',
    category: 'performance',
    severity: 'high',
    impact: 'high',
    description: 'Time to First Byte exceeds recommended performance threshold of 600ms.',
    detection: 'Measures live HTTP handshake and initial byte response latency.',
    recommendation: 'Leverage edge caching (CDN), enable HTTP/2 or HTTP/3, and optimize backend query times.',
    scoreImpact: 9,
    documentation: 'https://web.dev/articles/ttfb',
  },
  'IMG-001': {
    id: 'IMG-001',
    name: 'Missing Image Alt Text',
    category: 'content',
    severity: 'medium',
    impact: 'medium',
    description: 'One or more <img> elements lack descriptive alt attributes for accessibility and image search.',
    detection: 'Iterates through all discovered images and counts tags without an alt property.',
    recommendation: 'Provide meaningful alt descriptions for all content images (use alt="" only for decorative icons).',
    scoreImpact: 6,
    documentation: 'https://developers.google.com/search/docs/appearance/google-images',
  },
  'IMG-002': {
    id: 'IMG-002',
    name: 'Images Missing Explicit Dimensions',
    category: 'performance',
    severity: 'low',
    impact: 'low',
    description: 'Images lack width and height attributes, increasing Cumulative Layout Shift (CLS).',
    detection: 'Checks if image elements define explicit width and height or aspect-ratio.',
    recommendation: 'Specify width and height attributes on all responsive image containers.',
    scoreImpact: 4,
    documentation: 'https://web.dev/articles/optimize-cls',
  },
  'SEC-001': {
    id: 'SEC-001',
    name: 'Missing Modern Security Headers',
    category: 'security',
    severity: 'medium',
    impact: 'medium',
    description: 'Missing Strict-Transport-Security (HSTS), X-Content-Type-Options, or Referrer-Policy headers.',
    detection: 'Inspects HTTP response headers for standard security policies.',
    recommendation: 'Configure HSTS (max-age=31536000), nosniff, and strict-origin-when-cross-origin headers on web server.',
    scoreImpact: 5,
    documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
  },
  'AI-001': {
    id: 'AI-001',
    name: 'AI Engine Entity Citation Readiness',
    category: 'ai',
    severity: 'medium',
    impact: 'medium',
    description: 'Lack of machine-readable entity markers (Organization / SoftwareApplication / FAQ) reduces citation rate in generative answer engines (GEO / AEO).',
    detection: 'Analyzes JSON-LD for rich Knowledge Graph entity bindings.',
    recommendation: 'Deploy complete Schema.org entity graphs connecting the brand, authors, and topical entities.',
    scoreImpact: 6,
    documentation: 'https://schema.org/docs/documents.html',
  },
};

/**
 * Evaluates a single page's audit data against all registered SEO rules.
 */
export function evaluatePageRules(data: PageAuditData): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // TECH-001: HTTPS
  const isHttps = data.isHttps;
  results.push({
    rule: SEO_RULES_REGISTRY['TECH-001'],
    passed: isHttps,
    affectedCount: isHttps ? 0 : 1,
    evidence: isHttps ? `Page is securely served over HTTPS (${data.url})` : `Page is served over insecure HTTP protocol (${data.url})`,
    whyItMatters: 'HTTPS is a baseline ranking signal and protects user data integrity against eavesdropping.',
    recommendedFix: 'Install a valid SSL certificate and configure 301 redirects from http:// to https://.',
    affectedUrls: isHttps ? [] : [data.url],
  });

  // META-001: Missing title
  const hasTitle = Boolean(data.title && data.title.trim().length > 0);
  results.push({
    rule: SEO_RULES_REGISTRY['META-001'],
    passed: hasTitle,
    affectedCount: hasTitle ? 0 : 1,
    evidence: hasTitle ? `Found title: "${data.title}"` : 'No <title> tag detected in document <head>.',
    whyItMatters: 'Title tags are the single most significant on-page semantic anchor for search engine crawlers.',
    recommendedFix: 'Add a distinct, keyword-focused <title> tag inside the <head> block.',
    affectedUrls: hasTitle ? [] : [data.url],
    suggestedPatch: `<title>Primary Keyword — Brand Name</title>`,
  });

  // META-003: Title length
  const titleLen = data.title ? data.title.trim().length : 0;
  const isOptimalTitleLen = hasTitle && titleLen >= 25 && titleLen <= 65;
  results.push({
    rule: SEO_RULES_REGISTRY['META-003'],
    passed: isOptimalTitleLen,
    affectedCount: isOptimalTitleLen ? 0 : 1,
    evidence: hasTitle
      ? `Current title is ${titleLen} characters long ("${data.title}").`
      : 'Title is missing entirely.',
    whyItMatters: 'Titles under 25 chars lose opportunity to rank; titles over 65 chars get truncated with ellipses in SERPs.',
    recommendedFix: 'Refactor title tag to between 35 and 60 characters for optimal display.',
    affectedUrls: isOptimalTitleLen ? [] : [data.url],
  });

  // META-004: Meta description
  const hasMetaDesc = Boolean(data.metaDescription && data.metaDescription.trim().length > 0);
  results.push({
    rule: SEO_RULES_REGISTRY['META-004'],
    passed: hasMetaDesc,
    affectedCount: hasMetaDesc ? 0 : 1,
    evidence: hasMetaDesc
      ? `Meta description found (${data.metaDescription?.length} chars): "${data.metaDescription?.slice(0, 80)}..."`
      : 'No <meta name="description"> tag was discovered in the page head.',
    whyItMatters: 'Search engines frequently use meta descriptions as SERP snippet previews, directly influencing CTR.',
    recommendedFix: 'Inject a compelling meta description between 120 and 155 characters with a clear call-to-action.',
    affectedUrls: hasMetaDesc ? [] : [data.url],
    suggestedPatch: `<meta name="description" content="Discover actionable insights and tools to optimize your workflow with our verified platform." />`,
  });

  // CONTENT-001: Thin content
  const wordCount = data.wordCount || 0;
  const hasEnoughContent = wordCount >= 250;
  results.push({
    rule: SEO_RULES_REGISTRY['CONTENT-001'],
    passed: hasEnoughContent,
    affectedCount: hasEnoughContent ? 0 : 1,
    evidence: `Extracted readable text contains ${wordCount} words (minimum recommended is 250+).`,
    whyItMatters: 'Thin pages struggle to demonstrate topical authority and risk ranking penalties for low quality.',
    recommendedFix: 'Expand the page content with detailed body text, case studies, or contextual explanations.',
    affectedUrls: hasEnoughContent ? [] : [data.url],
  });

  // SCHEMA-001: Schema JSON-LD
  const hasValidSchema = data.jsonLd && data.jsonLd.some((s) => s.isValid);
  results.push({
    rule: SEO_RULES_REGISTRY['SCHEMA-001'],
    passed: Boolean(hasValidSchema),
    affectedCount: hasValidSchema ? 0 : 1,
    evidence: hasValidSchema
      ? `Discovered ${data.jsonLd.length} valid JSON-LD graph(s): [${data.jsonLd.flatMap(s => s.types).join(', ')}]`
      : 'No valid JSON-LD structured data detected on the page.',
    whyItMatters: 'Structured data enables rich snippet enhancements in Google SERP and boosts AI discoverability.',
    recommendedFix: 'Implement Schema.org JSON-LD markup appropriate for the page type.',
    affectedUrls: hasValidSchema ? [] : [data.url],
    suggestedPatch: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${data.title || 'Page Title'}",
  "url": "${data.url}"
}
</script>`,
  });

  // INDEX-001: Noindex
  const hasNoindex = Boolean(data.robotsMeta && data.robotsMeta.toLowerCase().includes('noindex'));
  results.push({
    rule: SEO_RULES_REGISTRY['INDEX-001'],
    passed: !hasNoindex,
    affectedCount: hasNoindex ? 1 : 0,
    evidence: hasNoindex
      ? `Robots meta tag explicitly specifies "noindex": "${data.robotsMeta}"`
      : 'No noindex blocking directives found.',
    whyItMatters: 'Pages with noindex will be completely omitted from Google and Bing organic search results.',
    recommendedFix: 'Remove the noindex token from <meta name="robots"> or HTTP X-Robots-Tag if indexing is desired.',
    affectedUrls: hasNoindex ? [data.url] : [],
  });

  // CANON-001: Canonical tag
  const hasCanonical = Boolean(data.canonical && data.canonical.trim().length > 0);
  results.push({
    rule: SEO_RULES_REGISTRY['CANON-001'],
    passed: hasCanonical,
    affectedCount: hasCanonical ? 0 : 1,
    evidence: hasCanonical
      ? `Canonical link specifies: "${data.canonical}"`
      : 'No <link rel="canonical"> element found in the document.',
    whyItMatters: 'Canonical tags prevent duplicate content issues when URLs contain UTM parameters or tracking queries.',
    recommendedFix: `Add <link rel="canonical" href="${data.url}" /> inside <head>.`,
    affectedUrls: hasCanonical ? [] : [data.url],
    suggestedPatch: `<link rel="canonical" href="${data.url}" />`,
  });

  // PERF-001: Response time
  const ttfb = data.responseTimeMs || data.performance?.ttfbMs || 0;
  const isFastResponse = ttfb > 0 && ttfb <= 750;
  results.push({
    rule: SEO_RULES_REGISTRY['PERF-001'],
    passed: isFastResponse,
    affectedCount: isFastResponse ? 0 : 1,
    evidence: `Server response latency measured at ${ttfb}ms (target is under 600ms).`,
    whyItMatters: 'High TTFB directly degrades Core Web Vitals (LCP) and limits bot crawl efficiency.',
    recommendedFix: 'Implement server response caching, reverse proxy CDN distribution, or database query tuning.',
    affectedUrls: isFastResponse ? [] : [data.url],
  });

  // IMG-001: Missing Image Alt
  const totalImgs = data.images.length;
  const missingAltCount = data.images.filter((img) => !img.hasAlt).length;
  const passedImgAlt = totalImgs === 0 || missingAltCount === 0;
  results.push({
    rule: SEO_RULES_REGISTRY['IMG-001'],
    passed: passedImgAlt,
    affectedCount: missingAltCount,
    evidence: totalImgs === 0
      ? 'No images present on page.'
      : `${missingAltCount} out of ${totalImgs} images are missing an alt attribute.`,
    whyItMatters: 'Missing alt attributes hurt screen reader accessibility and exclude images from Google Image search.',
    recommendedFix: 'Add descriptive alt="" attributes to all informative images.',
    affectedUrls: passedImgAlt ? [] : [data.url],
  });

  // SEC-001: Security headers
  const hasHsts = Boolean(data.securityHeaders.strictTransportSecurity);
  const hasNosniff = Boolean(data.securityHeaders.xContentTypeOptions);
  const passedSec = hasHsts && hasNosniff;
  results.push({
    rule: SEO_RULES_REGISTRY['SEC-001'],
    passed: passedSec,
    affectedCount: passedSec ? 0 : 1,
    evidence: `Security headers detected: HSTS: ${hasHsts ? 'Present' : 'Missing'}, X-Content-Type-Options: ${hasNosniff ? 'Present' : 'Missing'}.`,
    whyItMatters: 'Security headers safeguard against clickjacking, MIME sniffing, and MITM attacks.',
    recommendedFix: 'Add Strict-Transport-Security and X-Content-Type-Options: nosniff on your server or CDN.',
    affectedUrls: passedSec ? [] : [data.url],
    suggestedPatch: `Strict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin`,
  });

  // AI-001: AI Engine Entity Readiness
  const hasEntitySchema = data.jsonLd && data.jsonLd.some((s) =>
    s.types && s.types.some((t: string) => ['Organization', 'Product', 'SoftwareApplication', 'Article', 'FAQPage', 'Person'].includes(t))
  );
  results.push({
    rule: SEO_RULES_REGISTRY['AI-001'],
    passed: Boolean(hasEntitySchema),
    affectedCount: hasEntitySchema ? 0 : 1,
    evidence: hasEntitySchema
      ? 'High-confidence entity structured data detected for Generative Search / AEO.'
      : 'Page lacks rich entity Schema.org definitions, limiting AI answer engine synthesis.',
    whyItMatters: 'Generative search engines (Perplexity, Gemini, ChatGPT) heavily rely on structured entity graphs to cite authoritative answers.',
    recommendedFix: 'Embed Organization, Article, or Product Schema linking verified social profiles and official entities.',
    affectedUrls: hasEntitySchema ? [] : [data.url],
  });

  return results;
}
