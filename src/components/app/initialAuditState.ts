import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from '@/src/rules/types';
import { evaluatePageRules } from '@/src/rules/rulesRegistry';
import { calculateSeoHealthScore } from '@/src/rules/scoreEngine';

// Default initial state for demonstration before user runs an active audit
export const DEFAULT_INITIAL_PAGE_DATA: PageAuditData = {
  url: 'https://seox-platform.io',
  finalUrl: 'https://seox-platform.io/',
  status: 200,
  statusText: 'OK',
  responseTimeMs: 240,
  isHttps: true,
  contentType: 'text/html; charset=UTF-8',
  redirects: [],
  title: 'SEOX AI — Next-Generation Autonomous SEO Intelligence & Audit Engine',
  metaDescription: 'Inspect every technical SEO signal, Core Web Vitals latency, internal link equity and generative AI search discoverability in real time.',
  canonical: 'https://seox-platform.io/',
  robotsMeta: 'index, follow, max-snippet:-1, max-image-preview:large',
  viewport: 'width=device-width, initial-scale=1.0',
  charset: 'utf-8',
  wordCount: 1420,
  readingTimeMin: 7,
  headings: {
    h1: ['Understand Your Website. Fix Every SEO Signal.'],
    h2: ['Every SEO Signal. One Intelligence Layer.', 'Modular Diagnostic Engines', 'Live Intelligence at Scale.'],
    h3: ['Technical SEO Engine', 'Semantic Graph Analyzer', 'Domain Authority Radar'],
    h4: ['Crawl Status Matrix', 'Core Web Vitals Telemetry'],
    h5: [],
    h6: [],
  },
  links: {
    internal: [
      { href: 'https://seox-platform.io/features', anchor: 'Features', nofollow: false },
      { href: 'https://seox-platform.io/pricing', anchor: 'Pricing', nofollow: false },
      { href: 'https://seox-platform.io/docs/technical-audit', anchor: 'Technical Audit Docs', nofollow: false },
      { href: 'https://seox-platform.io/blog/core-web-vitals-2026', anchor: 'Core Web Vitals Guide', nofollow: false },
      { href: 'https://seox-platform.io/api', anchor: 'API Reference', nofollow: false },
    ],
    external: [
      { href: 'https://schema.org', anchor: 'Schema.org', nofollow: true },
      { href: 'https://web.dev', anchor: 'Web.dev Guidelines', nofollow: true },
    ],
    totalInternal: 5,
    totalExternal: 2,
  },
  images: [
    { src: '/assets/hero-sphere.webp', alt: 'Abstract 3D SEO Intelligence Sphere', hasAlt: true, hasDimensions: true, isModernFormat: true, width: 800, height: 800 },
    { src: '/assets/dashboard-hud.webp', alt: 'Real-time telemetry HUD overlay', hasAlt: true, hasDimensions: true, isModernFormat: true, width: 1200, height: 600 },
    { src: '/assets/partner-icon-1.png', alt: null, hasAlt: false, hasDimensions: false, isModernFormat: false },
  ],
  openGraph: {
    'og:title': 'SEOX AI — SEO Intelligence Platform',
    'og:description': 'Deep technical SEO auditing and AI recommendations.',
    'og:type': 'website',
    'og:url': 'https://seox-platform.io',
  },
  twitterCard: {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@seoxai',
  },
  hreflangs: [
    { lang: 'en', href: 'https://seox-platform.io/' },
    { lang: 'es', href: 'https://seox-platform.io/es/' },
  ],
  jsonLd: [
    {
      raw: '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"SEOX AI"}',
      parsed: { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SEOX AI' },
      isValid: true,
      types: ['SoftwareApplication'],
    },
    {
      raw: '{"@context":"https://schema.org","@type":"Organization","name":"SEOX Intelligence Inc"}',
      parsed: { '@context': 'https://schema.org', '@type': 'Organization', name: 'SEOX Intelligence Inc' },
      isValid: true,
      types: ['Organization'],
    },
  ],
  securityHeaders: {
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    contentSecurityPolicy: "default-src 'self'",
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  },
  performance: {
    ttfbMs: 185,
    downloadTimeMs: 45,
    contentLengthBytes: 42800,
  },
};

export const INITIAL_EVALUATIONS = evaluatePageRules(DEFAULT_INITIAL_PAGE_DATA);
export const INITIAL_HEALTH_SCORE = calculateSeoHealthScore(INITIAL_EVALUATIONS, undefined, 81);
