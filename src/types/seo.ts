export interface SeoScoreBreakdown {
  label: string;
  score: number;
  maxScore: number;
  status: 'optimal' | 'warning' | 'critical';
  trend: string;
  metric: string;
}

export interface SeoIssue {
  id: string;
  title: string;
  category: 'technical' | 'content' | 'performance' | 'indexing' | 'schema';
  severity: 'critical' | 'high' | 'warning' | 'passed';
  impact: string;
  affectedCount: number;
  recommendation: string;
  codeSnippet?: string;
}

export interface FeatureDetail {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  keyMetric: string;
  metricLabel: string;
  signalsCount: number;
  capabilities: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  actionItems?: string[];
  suggestedRoadmap?: boolean;
}

export interface AuditCrawlStep {
  step: number;
  name: string;
  detail: string;
  status: 'pending' | 'active' | 'completed';
}

export interface DomainAuditReport {
  domain: string;
  healthScore: number;
  totalPagesScanned: number;
  scanDuration: string;
  timestamp: string;
  scores: {
    technical: number;
    content: number;
    performance: number;
    indexability: number;
    aiDiscoverability: number;
  };
  issueCounts: {
    critical: number;
    high: number;
    warning: number;
    passed: number;
  };
  topIssues: SeoIssue[];
}
