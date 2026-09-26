/**
 * SEOX AI Database Data Models
 * Supports PostgreSQL / Prisma / Drizzle ORM mapping
 */

export interface DbUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface DbProject {
  id: string;
  userId: string;
  name: string;
  rootDomain: string;
  crawlLimit: number;
  autoCrawlSchedule?: string; // cron
  createdAt: Date;
  updatedAt: Date;
}

export interface DbDomain {
  id: string;
  projectId: string;
  hostname: string;
  isApex: boolean;
  ipAddress?: string;
  asn?: string;
  registrar?: string;
  sslValidUntil?: Date;
  dnssecEnabled: boolean;
  createdAt: Date;
}

export interface DbCrawl {
  id: string;
  projectId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  pagesDiscovered: number;
  pagesCrawled: number;
  errorsCount: number;
  warningsCount: number;
  healthScore: number;
}

export interface DbPage {
  id: string;
  crawlId: string;
  url: string;
  statusCode: number;
  depth: number;
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  wordCount: number;
  responseTimeMs: number;
  isIndexable: boolean;
  contentHash: string;
  inLinksCount: number;
  outLinksCount: number;
  createdAt: Date;
}

export interface DbIssue {
  id: string;
  crawlId: string;
  pageId?: string;
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  evidence: string;
  isResolved: boolean;
  firstSeenAt: Date;
  resolvedAt?: Date;
}

export interface DbRecommendation {
  id: string;
  crawlId: string;
  issueId?: string;
  finding: string;
  evidence: string;
  whyItMatters: string;
  fixGuide: string;
  effort: 'low' | 'medium' | 'high';
  expectedBenefit: string;
  confidenceScore: number; // 0.0 - 1.0
  generatedCodeSnippet?: string;
  createdAt: Date;
}

export interface DbSchemaResult {
  id: string;
  pageId: string;
  schemaType: string;
  isValid: boolean;
  rawJsonLd: string;
  errors?: string[];
}

export interface DbPerformanceResult {
  id: string;
  pageId: string;
  device: 'mobile' | 'desktop';
  lcpMs: number;
  inpMs: number;
  clsScore: number;
  fcpMs: number;
  ttfbMs: number;
  lighthouseScore?: number;
  createdAt: Date;
}

export interface DbDNSRecord {
  id: string;
  domainId: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'CAA';
  value: string;
  ttl: number;
  lastCheckedAt: Date;
}

export interface DbSSLRecord {
  id: string;
  domainId: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  protocol: string;
  cipherSuite?: string;
  daysRemaining: number;
}

export interface DbAuditSnapshot {
  id: string;
  projectId: string;
  healthScore: number;
  technicalScore: number;
  onPageScore: number;
  performanceScore: number;
  criticalIssues: number;
  highIssues: number;
  passedCount: number;
  createdAt: Date;
}
