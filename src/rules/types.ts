export type RuleCategory =
  | 'technical'
  | 'content'
  | 'links'
  | 'performance'
  | 'schema'
  | 'indexability'
  | 'security'
  | 'ai';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';

export interface SeoRule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: RuleSeverity;
  impact: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detection: string;
  recommendation: string;
  scoreImpact: number;
  documentation: string;
}

export interface RuleEvaluationResult {
  rule: SeoRule;
  passed: boolean;
  affectedCount: number;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  affectedUrls: string[];
  suggestedPatch?: string;
}

export interface PageAuditData {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  isHttps: boolean;
  contentType: string;
  redirects: Array<{ from: string; to: string; status: number }>;
  
  // HTML extracted data
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  viewport: string | null;
  charset: string | null;
  wordCount: number;
  readingTimeMin: number;
  
  // Headings
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  
  // Links
  links: {
    internal: Array<{ href: string; anchor: string; nofollow: boolean }>;
    external: Array<{ href: string; anchor: string; nofollow: boolean }>;
    totalInternal: number;
    totalExternal: number;
  };
  
  // Images
  images: Array<{
    src: string;
    alt: string | null;
    hasAlt: boolean;
    hasDimensions: boolean;
    isModernFormat: boolean;
    width?: number;
    height?: number;
    loading?: string;
  }>;
  
  // Social & Meta
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  hreflangs: Array<{ lang: string; href: string }>;
  
  // Schema / JSON-LD
  jsonLd: Array<{
    raw: string;
    parsed: any;
    isValid: boolean;
    types: string[];
    error?: string;
  }>;
  
  // Security Headers
  securityHeaders: {
    strictTransportSecurity: string | null;
    contentSecurityPolicy: string | null;
    xFrameOptions: string | null;
    xContentTypeOptions: string | null;
    referrerPolicy: string | null;
    permissionsPolicy: string | null;
  };

  // Performance timings (from live probe)
  performance: {
    ttfbMs: number;
    dnsTimeMs?: number;
    downloadTimeMs: number;
    contentLengthBytes: number;
  };
}

export interface CategoryScore {
  category: RuleCategory;
  label: string;
  score: number;
  weight: number;
  passedCount: number;
  issueCount: number;
}

export interface OverallHealthScore {
  score: number; // 0 - 100
  trend: number; // e.g. +6
  categories: Record<string, CategoryScore>;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    total: number;
  };
}
