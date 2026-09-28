import { SITE_ORIGIN } from './siteIdentity';

export interface SeoToolPage {
  slug: string;
  path: string;
  name: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  what: string;
  how: string;
  use: string;
  meaning: string;
  fixes: string[];
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
  operation: 'url-audit' | 'keyword-volume' | 'keyword-ideas' | 'backlinks' | 'redirect' | 'domain' | 'schema' | 'sitemap';
  auditFocus?: 'all' | 'technical' | 'on-page' | 'website' | 'meta';
}

export const SEO_TOOLS_BASE = '/seo-tools/';
export const SEO_PRODUCTION_ORIGIN = SITE_ORIGIN;

export const seoToolPages: SeoToolPage[] = [
  {
    slug: 'seo-checker',
    path: `${SEO_TOOLS_BASE}seo-checker/`,
    name: 'SEO Checker',
    title: 'Free SEO Checker',
    metaTitle: 'Free SEO Checker: Audit a Website URL | SEOX AI',
    metaDescription: 'Run a live SEO check for a public URL. Inspect HTTP status, titles, headings, links, images, canonical tags, structured data and technical signals.',
    description: 'Check a public page against live technical and on-page SEO signals. Results come from the page fetched at the time of your scan.',
    what: 'An SEO checker fetches a page and reports observable signals that affect how search engines can crawl, understand and present it.',
    how: 'SEOX AI requests the submitted URL from the server, parses its response and evaluates the returned page data with the existing SEO rule engine.',
    use: 'Enter a complete public URL, run the check, then review the HTTP response and each extracted SEO signal. A scan is a point-in-time inspection, not a ranking prediction.',
    meaning: 'PASS means the inspected rule found no issue in the response. Warnings and errors identify evidence and a recommended next step; they do not guarantee ranking outcomes.',
    fixes: ['Resolve crawl or HTTP errors before optimizing copy.', 'Use a unique title, description and canonical that match the page.', 'Review failed checks against the rendered page and server response before deploying changes.'],
    faqs: [
      { question: 'Does the SEO checker predict rankings?', answer: 'No. It checks technical and page-level evidence and does not predict search positions.' },
      { question: 'Does it store the page content?', answer: 'The checker returns audit data for the current request; it does not claim to maintain a permanent crawl archive.' },
    ],
    related: ['technical-seo-checker', 'on-page-seo-checker', 'website-analyzer'],
    operation: 'url-audit',
    auditFocus: 'all',
  },
  {
    slug: 'technical-seo-checker',
    path: `${SEO_TOOLS_BASE}technical-seo-checker/`,
    name: 'Technical SEO Checker',
    title: 'Technical SEO Checker',
    metaTitle: 'Technical SEO Checker: Crawl and Index Signals | SEOX AI',
    metaDescription: 'Inspect live HTTPS, HTTP status, canonical, robots directives, redirects, response time, security headers and structured data for a URL.',
    description: 'Inspect the crawl and index signals returned by a live page response without substituting sample metrics.',
    what: 'Technical SEO checks help identify whether a page can be fetched and whether important crawl, index and security signals are present.',
    how: 'Submit a public URL. The server fetches the page and returns its response, extracted directives, redirects, headers and schema parse results.',
    use: 'Start with the final response and redirect chain, then inspect canonical, robots, security and structured data findings.',
    meaning: 'A missing field is reported as unavailable or missing in the fetched document; it is not inferred from another page.',
    fixes: ['Use HTTPS consistently and resolve unexpected response codes.', 'Ensure canonical and robots directives reflect the intended indexation policy.', 'Check redirects one hop at a time and remove unnecessary chains.'],
    faqs: [
      { question: 'Can this check every URL on a site?', answer: 'This tool inspects the URL submitted. Use the crawler in the SEOX AI application for a site crawl.' },
      { question: 'Does a passing technical check guarantee indexing?', answer: 'No. Indexing decisions are made by search engines and depend on many signals beyond this inspection.' },
    ],
    related: ['seo-checker', 'redirect-checker', 'sitemap-checker', 'domain-checker'],
    operation: 'url-audit',
    auditFocus: 'technical',
  },
  {
    slug: 'on-page-seo-checker',
    path: `${SEO_TOOLS_BASE}on-page-seo-checker/`,
    name: 'On-Page SEO Checker',
    title: 'On-Page SEO Checker',
    metaTitle: 'On-Page SEO Checker: Titles, Headings and Links | SEOX AI',
    metaDescription: 'Check a live page title, description, headings, content length, links, image alt text, canonical and social metadata.',
    description: 'Review the on-page elements extracted from the page you submit, with evidence from its current HTML response.',
    what: 'On-page SEO describes the content and HTML signals on an individual page that help visitors and crawlers understand its subject.',
    how: 'The checker fetches a public URL and extracts titles, descriptions, heading levels, links, images, canonical and social metadata.',
    use: 'Submit a URL and compare the extracted structure with the page purpose. Evaluate whether headings and links are useful to readers rather than targeting a fixed keyword-density threshold.',
    meaning: 'Counts describe the fetched HTML. They are not universal quality thresholds and may differ from content rendered only by client-side scripts.',
    fixes: ['Write a specific, descriptive title and meta description.', 'Keep one clear primary heading and organize sections logically.', 'Add meaningful alt text where an image conveys information.'],
    faqs: [
      { question: 'Does this use a keyword-density score?', answer: 'No. Keyword density is not used as an absolute quality criterion.' },
      { question: 'Can it read JavaScript-rendered content?', answer: 'The live crawler parses the returned HTML response; content created only after browser rendering may not be included.' },
    ],
    related: ['seo-checker', 'meta-tag-checker', 'keyword-research'],
    operation: 'url-audit',
    auditFocus: 'on-page',
  },
  {
    slug: 'keyword-research',
    path: `${SEO_TOOLS_BASE}keyword-research/`,
    name: 'Keyword Research',
    title: 'Keyword Research Tool',
    metaTitle: 'Keyword Research Tool: Seed Ideas and Intent | SEOX AI',
    metaDescription: 'Explore related keyword ideas, long-tail variations and estimated search intent from a seed phrase. No fabricated volume metrics.',
    description: 'Generate clearly labeled AI keyword ideas from a seed phrase. Search volume and CPC are not included unless a separate data provider reports them.',
    what: 'Keyword research organizes the language people may use around a topic so you can plan useful pages and understand search intent.',
    how: 'The server-side language model proposes related phrases, groups and intent labels from the seed you provide. It does not return provider-verified volume.',
    use: 'Enter a seed phrase, review the suggested clusters and intent labels, then validate demand with the Keyword Volume tool when a supported provider is configured.',
    meaning: 'Ideas and intent labels are model-generated suggestions, not measured query demand, search volume, CPC or competition.',
    fixes: ['Validate promising ideas against a real keyword data provider.', 'Check the actual search results before assigning a page to a query.', 'Merge overlapping topics when they would serve the same intent.'],
    faqs: [
      { question: 'Are keyword ideas measured search data?', answer: 'No. They are AI-generated suggestions. No search volume, CPC or competition is claimed.' },
      { question: 'Why is the tool unavailable?', answer: 'Keyword ideation requires the server-side Gemini provider to be configured.' },
    ],
    related: ['keyword-volume', 'on-page-seo-checker', 'seo-checker'],
    operation: 'keyword-ideas',
  },
  {
    slug: 'keyword-volume',
    path: `${SEO_TOOLS_BASE}keyword-volume/`,
    name: 'Keyword Volume',
    title: 'Keyword Volume Checker',
    metaTitle: 'Keyword Volume Checker for Southeast Asia | SEOX AI',
    metaDescription: 'Check provider-estimated monthly keyword volume by Southeast Asian country. Missing provider data stays unknown, never replaced with demo values.',
    description: 'Compare real provider-reported monthly volume estimates across Southeast Asia. Results are unavailable until Ahrefs or DataForSEO is configured.',
    what: 'A keyword volume checker reports a provider’s estimate of monthly searches for a phrase in a selected market.',
    how: 'Choose a configured provider, enter a keyword and select countries. The server queries the provider and normalizes returned country values.',
    use: 'Select the markets you plan to serve and compare their reported estimates. Use the source and update timestamp when interpreting the results.',
    meaning: 'Volume is an estimate, not an exact count. A missing country result stays null and is not treated as zero.',
    fixes: ['Connect Ahrefs or DataForSEO on the server to enable lookups.', 'Check country selection and provider availability when a value is missing.', 'Use search intent and business fit alongside volume estimates.'],
    faqs: [
      { question: 'Why is no volume shown?', answer: 'A supported provider must be configured, and some providers may not return a value for every country.' },
      { question: 'Are the API keys sent to my browser?', answer: 'No. Provider credentials are read and used on the server only.' },
    ],
    related: ['keyword-research', 'on-page-seo-checker', 'seo-checker'],
    operation: 'keyword-volume',
  },
  {
    slug: 'backlink-checker',
    path: `${SEO_TOOLS_BASE}backlink-checker/`,
    name: 'Backlink Checker',
    title: 'Backlink Checker',
    metaTitle: 'Backlink Checker: Referring Domains and Links | SEOX AI',
    metaDescription: 'Inspect provider-reported backlinks, referring domains, anchors and link attributes. No backlink metrics or link records are fabricated.',
    description: 'Query an available backlink provider for link records and referring-domain metrics. The tool stays empty when no provider is configured.',
    what: 'A backlink checker summarizes links that a third-party index has discovered pointing to a target domain.',
    how: 'Choose an available provider and submit a domain. SEOX AI requests the provider’s records through the server-side adapter.',
    use: 'Review referring domains, source and target URLs, anchor text and follow attributes only when the provider returns them.',
    meaning: 'Backlink indexes are provider-specific and incomplete snapshots of the web; results do not represent every live link.',
    fixes: ['Configure a supported backlink provider to enable data.', 'Inspect source pages before acting on an anchor or risk label.', 'Treat missing provider records as unavailable, not proof that no links exist.'],
    faqs: [
      { question: 'Does SEOX AI create sample backlinks?', answer: 'No. If no provider is configured, metrics and link records remain unavailable.' },
      { question: 'Are backlink counts identical across tools?', answer: 'No. Providers crawl different parts of the web and use different refresh schedules and definitions.' },
    ],
    related: ['domain-checker', 'seo-checker', 'keyword-research'],
    operation: 'backlinks',
  },
  {
    slug: 'redirect-checker',
    path: `${SEO_TOOLS_BASE}redirect-checker/`,
    name: 'Redirect 301 Checker',
    title: 'Redirect 301 Checker',
    metaTitle: 'Redirect 301 Checker: Inspect Redirect Chains | SEOX AI',
    metaDescription: 'Follow a public URL redirect chain and inspect HTTP status, final URL, response time, loops and canonical destination with SSRF protection.',
    description: 'Use the existing server-side redirect checker to inspect redirects without following private or internal network targets.',
    what: 'A redirect checker shows how a URL moves from its starting address to the final response and whether permanent redirects behave as intended.',
    how: 'The server manually follows public HTTP and HTTPS redirects, validates each destination, detects loops and stops after ten hops.',
    use: 'Enter the source URL and preferred canonical domain. Inspect every hop, status, Location and the final response.',
    meaning: 'PASS, WARNING and ERROR classify the observed chain; a check is not a substitute for testing important URLs after a migration.',
    fixes: ['Use a single permanent 301 where a URL has moved permanently.', 'Update links to point directly to the final destination.', 'Correct loops and redirect targets that do not match the intended canonical domain.'],
    faqs: [
      { question: 'How many redirects are followed?', answer: 'At most ten hops. The checker stops if it detects a loop or an unsafe destination.' },
      { question: 'Can it check localhost or private IPs?', answer: 'No. SSRF protections block private, local and internal network destinations.' },
    ],
    related: ['domain-checker', 'technical-seo-checker', 'seo-checker'],
    operation: 'redirect',
  },
  {
    slug: 'domain-checker',
    path: `${SEO_TOOLS_BASE}domain-checker/`,
    name: 'Domain Checker',
    title: 'Domain SEO Checker',
    metaTitle: 'Domain Checker: DNS, SSL and Redirect Status | SEOX AI',
    metaDescription: 'Check public DNS records and TLS certificate details for a domain, then inspect its HTTP and www redirect behavior.',
    description: 'Inspect public DNS and TLS certificate information from live server lookups. No WHOIS or private registration details are displayed.',
    what: 'A domain checker helps verify that a domain resolves publicly and that its TLS certificate can be inspected.',
    how: 'The server resolves public DNS records and opens a TLS connection to obtain certificate dates. Unavailable records are shown as unavailable.',
    use: 'Enter a hostname without credentials or private URL data. Review DNS and certificate results, then use Redirect 301 Checker for a complete redirect chain.',
    meaning: 'DNS record types may legitimately be absent. Certificate information describes the host at the time of the request.',
    fixes: ['Verify the domain spelling and public DNS configuration.', 'Renew or repair an expired or invalid TLS certificate.', 'Check apex and www redirect policy separately.'],
    faqs: [
      { question: 'Does this show WHOIS registrant details?', answer: 'No. The checker reports public DNS and TLS data only.' },
      { question: 'Why might a record be blank?', answer: 'The hostname may not publish that record type or the resolver may not return it.' },
    ],
    related: ['redirect-checker', 'technical-seo-checker', 'sitemap-checker'],
    operation: 'domain',
  },
  {
    slug: 'website-analyzer',
    path: `${SEO_TOOLS_BASE}website-analyzer/`,
    name: 'Website Analyzer',
    title: 'Website Analyzer',
    metaTitle: 'Website Analyzer: Live Page SEO Inspection | SEOX AI',
    metaDescription: 'Analyze a public page response with SEOX AI’s live URL inspection. For multi-page analysis, use the site crawler in the application.',
    description: 'Run a live page-level inspection of the URL you submit. For a multi-page crawl, use the site crawler in the SEOX AI application.',
    what: 'A website analyzer gathers page-level evidence about response status, content structure and technical SEO signals.',
    how: 'This tool sends a live request to the supplied URL and parses the response with SEOX AI’s existing audit engine.',
    use: 'Inspect the homepage or an important landing page, then run separate checks for URLs with different templates.',
    meaning: 'The results cover the submitted URL only. They do not claim to summarize pages that were not crawled.',
    fixes: ['Run checks on representative templates, not just the homepage.', 'Use the multi-page crawler when you need site-wide coverage.', 'Recheck after deploying technical or content changes.'],
    faqs: [
      { question: 'Does Website Analyzer crawl the entire site?', answer: 'This page checks one URL. The SEOX AI application includes a separate multi-page crawler.' },
      { question: 'Are results simulated?', answer: 'No. Audit results are based on the live response, and failed requests are reported as errors.' },
    ],
    related: ['seo-checker', 'technical-seo-checker', 'on-page-seo-checker'],
    operation: 'url-audit',
    auditFocus: 'website',
  },
  {
    slug: 'meta-tag-checker',
    path: `${SEO_TOOLS_BASE}meta-tag-checker/`,
    name: 'Meta Tag Checker',
    title: 'Meta Tag Checker',
    metaTitle: 'Meta Tag Checker: Title, Description and Social Tags | SEOX AI',
    metaDescription: 'Inspect live title, meta description, canonical, robots, Open Graph, Twitter Card, viewport and document language.',
    description: 'Read the metadata returned in a live HTML response and identify missing or unexpected tags.',
    what: 'Meta tags and document metadata provide search engines, browsers and social platforms with information about a page.',
    how: 'The live audit parses the document head and reports the tags it finds in the server response.',
    use: 'Submit the exact page URL shared with users, then compare title, description, canonical and social tags with the intended page.',
    meaning: 'The result reflects tags present in returned HTML. Tags injected only after browser JavaScript runs may not be observed.',
    fixes: ['Write a distinct title and description for the page.', 'Point canonical to the preferred version of that same content.', 'Add accurate Open Graph and Twitter tags for share previews.'],
    faqs: [
      { question: 'Does a missing Open Graph tag block indexing?', answer: 'Open Graph tags are primarily used for social previews; their absence is not an indexing directive.' },
      { question: 'Does this check rendered HTML?', answer: 'It parses the HTML response fetched by the server, not a browser-rendered DOM.' },
    ],
    related: ['on-page-seo-checker', 'seo-checker', 'schema-checker'],
    operation: 'url-audit',
    auditFocus: 'meta',
  },
  {
    slug: 'schema-checker',
    path: `${SEO_TOOLS_BASE}schema-checker/`,
    name: 'Schema Checker',
    title: 'Schema Markup Checker',
    metaTitle: 'Schema Checker: Validate JSON-LD Syntax and Types | SEOX AI',
    metaDescription: 'Validate JSON-LD syntax, inspect @context and @type, and review schema types extracted from a live page.',
    description: 'Paste JSON-LD to validate its JSON syntax, or inspect structured data extracted from a public URL.',
    what: 'Structured data is machine-readable markup that describes entities and page content using a vocabulary such as Schema.org.',
    how: 'Paste a JSON object or submit a URL. The checker parses JSON syntax and reports context, type and extracted schema types.',
    use: 'Validate syntax first, then check that the declared type and properties accurately describe visible page content.',
    meaning: 'Valid JSON syntax does not guarantee eligibility for a rich result. Search engines apply their own guidelines and validation.',
    fixes: ['Use a valid JSON object and a supported context.', 'Add an accurate @type and stable @id where appropriate.', 'Do not mark up content that visitors cannot see or information that is not true.'],
    faqs: [
      { question: 'Does valid JSON-LD guarantee a rich result?', answer: 'No. Search engines decide eligibility and may ignore valid structured data.' },
      { question: 'Does the checker invent missing properties?', answer: 'No. It reports syntax and extracted fields; it does not generate claims about your page.' },
    ],
    related: ['seo-checker', 'technical-seo-checker', 'meta-tag-checker'],
    operation: 'schema',
  },
  {
    slug: 'sitemap-checker',
    path: `${SEO_TOOLS_BASE}sitemap-checker/`,
    name: 'Sitemap Checker',
    title: 'XML Sitemap Checker',
    metaTitle: 'Sitemap Checker: Inspect XML and URL Entries | SEOX AI',
    metaDescription: 'Check a site’s robots.txt and sitemap discovery, XML response status, URL counts and sitemap index signals from live requests.',
    description: 'Fetch a public domain’s robots.txt and sitemap.xml to report response and parsed sitemap details.',
    what: 'An XML sitemap lists URLs that a site wants crawlers to discover; robots.txt can point crawlers to sitemap files.',
    how: 'The server requests the conventional robots.txt and sitemap.xml locations for a public hostname and parses discovered sitemap and URL entries.',
    use: 'Enter a domain, then check whether robots.txt declares a sitemap and whether the sitemap endpoint returns XML with URL locations.',
    meaning: 'A sitemap is a discovery hint, not a guarantee that every listed URL will be crawled or indexed.',
    fixes: ['Return valid XML from the sitemap endpoint.', 'Use absolute canonical URLs from one HTTPS host.', 'Remove redirects, errors and URLs that should not be indexed.'],
    faqs: [
      { question: 'Can a sitemap guarantee indexation?', answer: 'No. It helps discovery; search engines decide whether to crawl and index each URL.' },
      { question: 'Does the checker follow a robots.txt sitemap declaration?', answer: 'It checks the conventional /sitemap.xml endpoint and reports sitemap declarations found in robots.txt.' },
    ],
    related: ['technical-seo-checker', 'domain-checker', 'seo-checker'],
    operation: 'sitemap',
  },
];

export const seoToolBySlug = new Map(seoToolPages.map((tool) => [tool.slug, tool]));
export const seoToolByPath = new Map(seoToolPages.map((tool) => [tool.path, tool]));

export function normalizeSeoToolsPath(pathname: string): string {
  if (pathname === '/seo-tools') return SEO_TOOLS_BASE;
  if (pathname.startsWith(SEO_TOOLS_BASE) && !pathname.endsWith('/')) return `${pathname}/`;
  return pathname;
}
