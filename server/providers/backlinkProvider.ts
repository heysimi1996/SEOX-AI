/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Backlink {
  id: string;
  sourceDomain: string;
  sourceUrl: string;
  targetUrl: string;
  anchor: string;
  linkType: 'text' | 'image' | 'redirect' | 'canonical' | 'frame';
  isFollow: boolean | null;
  providerRank: number | null;
  pageRank: number | null;
  firstSeen: string | null;
  lastSeen: string | null;
  ipAddress?: string;
  cBlock?: string;
  tld?: string;
  spamScore?: number;
}

export interface BacklinkMetrics {
  totalBacklinks: number;
  referringDomains: number;
  dofollowCount: number | null;
  nofollowCount: number | null;
  dofollowPercentage: number | null;
}

export interface BacklinkRiskIndicator {
  id: string;
  name: string;
  level: 'Low' | 'Medium' | 'High';
  evidence: string;
  affectedCount: number;
  recommendation: string;
}

export interface BacklinkRiskAssessment {
  overallRisk: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-100
  methodologyNote: string;
  indicators: BacklinkRiskIndicator[];
  summary: string;
}

export interface BacklinkFilterOptions {
  limit?: number;
  onlyDofollow?: boolean;
  minAuthority?: number;
  searchAnchor?: string;
}

export interface BacklinkProviderResponse {
  status: 'configured' | 'not_configured';
  metrics: BacklinkMetrics | null;
  backlinks: Backlink[];
  riskAssessment: BacklinkRiskAssessment | null;
  provider: string;
  isLive: boolean;
  configured: boolean;
  message?: string;
}

export interface BacklinkProvider {
  id: string;
  name: string;
  isConfigured: () => boolean;
  fetchBacklinks: (domain: string, options?: BacklinkFilterOptions) => Promise<BacklinkProviderResponse>;
}

// -------------------------------------------------------------
// Backlink Risk Engine (Algorithmic Indicator Evaluation)
// -------------------------------------------------------------
export function evaluateBacklinkRisk(backlinks: Backlink[]): BacklinkRiskAssessment {
  const indicators: BacklinkRiskIndicator[] = [];
  const total = backlinks.length;

  if (total === 0) {
    return {
      overallRisk: 'Low',
      riskScore: 0,
      methodologyNote: 'Low authority links are not automatically deemed toxic. Evaluation analyzes manipulative patterns, unnatural anchor concentrations, sitewide repetition, and sudden spikes.',
      indicators: [],
      summary: 'No external backlinks recorded for evaluation.',
    };
  }

  // 1. High exact-match anchor concentration
  const anchorCounts: Record<string, number> = {};
  for (const link of backlinks) {
    const norm = (link.anchor || '').trim().toLowerCase();
    if (norm) {
      anchorCounts[norm] = (anchorCounts[norm] || 0) + 1;
    }
  }

  const genericOrBranded = ['here', 'website', 'source', 'click here', 'link', 'visit site', 'learn more'];
  let maxCommercialAnchor = '';
  let maxCommercialCount = 0;

  for (const [anchor, count] of Object.entries(anchorCounts)) {
    if (!genericOrBranded.includes(anchor) && anchor.length > 2) {
      if (count > maxCommercialCount) {
        maxCommercialCount = count;
        maxCommercialAnchor = anchor;
      }
    }
  }

  const commercialRatio = maxCommercialCount / total;
  if (commercialRatio > 0.35 && maxCommercialCount >= 3) {
    indicators.push({
      id: 'RISK-ANCHOR-EXACT',
      name: 'High Exact-Match Anchor Concentration',
      level: commercialRatio > 0.55 ? 'High' : 'Medium',
      evidence: `The commercial anchor "${maxCommercialAnchor}" accounts for ${(commercialRatio * 100).toFixed(1)}% of your backlink profile (${maxCommercialCount}/${total} links). Healthy organic thresholds typically keep exact commercial matches under 15-20%.`,
      affectedCount: maxCommercialCount,
      recommendation: 'Diversify anchor profile by earning organic brand-name, bare URL, and co-citation anchors.',
    });
  }

  // 2. Sitewide link patterns (single domain or identical C-block concentration)
  const domainCounts: Record<string, number> = {};
  const cBlockCounts: Record<string, number> = {};

  for (const link of backlinks) {
    domainCounts[link.sourceDomain] = (domainCounts[link.sourceDomain] || 0) + 1;
    if (link.cBlock) {
      cBlockCounts[link.cBlock] = (cBlockCounts[link.cBlock] || 0) + 1;
    }
  }

  let sitewideDominantDomain = '';
  let sitewideDominantCount = 0;
  for (const [dom, cnt] of Object.entries(domainCounts)) {
    if (cnt > sitewideDominantCount) {
      sitewideDominantCount = cnt;
      sitewideDominantDomain = dom;
    }
  }

  if (sitewideDominantCount > 10 && sitewideDominantCount / total > 0.45) {
    indicators.push({
      id: 'RISK-SITEWIDE-FOOTER',
      name: 'Sitewide Template / Footer Link Concentration',
      level: sitewideDominantCount / total > 0.7 ? 'High' : 'Medium',
      evidence: `Single domain (${sitewideDominantDomain}) accounts for ${sitewideDominantCount} links (${((sitewideDominantCount / total) * 100).toFixed(1)}% of all links), indicating repetitive sitewide footer or sidebar widgets.`,
      affectedCount: sitewideDominantCount,
      recommendation: 'Request webmaster change link to single editorial mention or add rel="nofollow" to global footer templates.',
    });
  }

  // 3. Irrelevant / Risky TLDs & adult/casino pattern check
  const suspiciousKeywords = ['casino', 'viagra', 'payday', 'replica', 'poker', 'crypto-airdrop', 'free-download', 'hack'];
  const riskyTLDs = ['.xyz', '.top', '.buzz', '.work', '.click', '.loan', '.gq', '.cf', '.tk'];
  
  let suspiciousLinksCount = 0;
  const suspiciousExamples: string[] = [];

  for (const link of backlinks) {
    const text = `${link.sourceUrl} ${link.anchor} ${link.sourceDomain}`.toLowerCase();
    const hasKeyword = suspiciousKeywords.some(k => text.includes(k));
    const hasRiskyTLD = riskyTLDs.some(tld => link.sourceDomain.endsWith(tld));

    if (hasKeyword || (hasRiskyTLD && link.providerRank !== null && link.providerRank < 15)) {
      suspiciousLinksCount++;
      if (suspiciousExamples.length < 2) {
        suspiciousExamples.push(link.sourceDomain);
      }
    }
  }

  if (suspiciousLinksCount > 0) {
    const ratio = suspiciousLinksCount / total;
    indicators.push({
      id: 'RISK-IRRELEVANT-NICHE',
      name: 'Irrelevant Linking Domains & Low-Trust TLD Patterns',
      level: ratio > 0.25 ? 'High' : ratio > 0.1 ? 'Medium' : 'Low',
      evidence: `Detected ${suspiciousLinksCount} links from low-trust or commercially disconnected domains (${suspiciousExamples.join(', ')}).`,
      affectedCount: suspiciousLinksCount,
      recommendation: 'Audit these domains; if automated scraper syndication persists, add them to your Google Disavow file candidate list.',
    });
  }

  // 4. Low dofollow velocity without natural nofollow ratio
  const dofollowCount = backlinks.filter(b => b.isFollow).length;
  const dofollowRatio = dofollowCount / total;
  if (total >= 10 && dofollowRatio > 0.96) {
    indicators.push({
      id: 'RISK-UNNATURAL-FOLLOW-RATIO',
      name: 'Unnatural Dofollow Ratio',
      level: 'Low',
      evidence: `96%+ of backlinks are dofollow (${dofollowCount}/${total}). Organic web profiles naturally accumulate 15-40% nofollow / user-generated / sponsored attributes from forums and news outlets.`,
      affectedCount: dofollowCount,
      recommendation: 'Monitor link velocity to ensure organic, holistic mentions across platforms.',
    });
  }

  // Calculate Risk Score
  let score = 10;
  if (indicators.some(i => i.level === 'High')) score += 45;
  if (indicators.filter(i => i.level === 'Medium').length >= 1) score += 25;
  if (indicators.filter(i => i.level === 'Low').length >= 1) score += 10;
  score = Math.min(100, Math.max(0, score));

  const overallRisk: 'Low' | 'Medium' | 'High' = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low';

  return {
    overallRisk,
    riskScore: score,
    methodologyNote: 'Low domain authority alone does NOT constitute toxic backlink risk. Genuine editorial mentions from nascent websites are natural. Risk score evaluates manipulative footprints, excessive commercial anchor density, and repetitive IP/sitewide patterns.',
    indicators,
    summary: indicators.length === 0
      ? 'Clean backlink footprint. No manipulative anchor concentration or sitewide anomalies detected.'
      : `Identified ${indicators.length} risk pattern(s). Highest severity: ${overallRisk}.`,
  };
}

// -------------------------------------------------------------
// Provider Adapters: Replaceable Architecture
// -------------------------------------------------------------

export class DataForSeoAdapter implements BacklinkProvider {
  id = 'dataforseo';
  name = 'DataForSEO';

  isConfigured(): boolean {
    return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
  }

  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    const configured = this.isConfigured();
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    if (!configured) {
      return {
        status: 'not_configured',
        metrics: null,
        backlinks: [],
        riskAssessment: null,
        provider: this.name,
        isLive: false,
        configured: false,
        message: 'Chưa kết nối nguồn dữ liệu backlink',
      };
    }

    // Call real DataForSEO API endpoint if configured
    try {
      const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
      const res = await fetch('https://api.dataforseo.com/v3/backlinks/backlinks/live', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            target: cleanDomain,
            limit: options?.limit || 50,
            mode: 'as_is',
          },
        ]),
      });

      if (!res.ok) throw new Error(`DataForSEO returned HTTP ${res.status}.`);
      const json = await res.json();
      const items: unknown = json?.tasks?.[0]?.result?.[0]?.items;
      if (!Array.isArray(items)) throw new Error('DataForSEO returned no backlink records.');

      const numericValue = (value: unknown): number | null => (
        typeof value === 'number' && Number.isFinite(value) ? value : null
      );
      const stringValue = (value: unknown): string | null => (
        typeof value === 'string' && value.trim() ? value.trim() : null
      );
      const backlinks: Backlink[] = items.flatMap((rawItem: unknown, index: number) => {
        if (!rawItem || typeof rawItem !== 'object') return [];
        const item = rawItem as Record<string, unknown>;
        const sourceUrl = stringValue(item.url_from);
        const targetUrl = stringValue(item.url_to);
        if (!sourceUrl || !targetUrl) return [];
        let sourceDomain = stringValue(item.domain_from);
        try {
          sourceDomain ||= new URL(sourceUrl).hostname;
        } catch {
          return [];
        }
        return [{
          id: `dfs_${index}_${sourceUrl}`,
          sourceDomain,
          sourceUrl,
          targetUrl,
          anchor: stringValue(item.anchor) ?? '',
          linkType: item.is_image === true ? 'image' : 'text',
          isFollow: typeof item.dofollow === 'boolean' ? item.dofollow : null,
          providerRank: numericValue(item.rank),
          pageRank: numericValue(item.page_from_rank),
          firstSeen: stringValue(item.first_seen),
          lastSeen: stringValue(item.last_visited),
        }];
      });

      const knownFollowFlags = backlinks.filter((link) => link.isFollow !== null);
      const dofollowCount = knownFollowFlags.filter((link) => link.isFollow === true).length;
      const refDomains = new Set(backlinks.map(b => b.sourceDomain)).size;
      const metrics: BacklinkMetrics = {
        totalBacklinks: backlinks.length,
        referringDomains: refDomains,
        dofollowCount: knownFollowFlags.length ? dofollowCount : null,
        nofollowCount: knownFollowFlags.length ? knownFollowFlags.length - dofollowCount : null,
        dofollowPercentage: knownFollowFlags.length ? Math.round((dofollowCount / knownFollowFlags.length) * 100) : null,
      };

      return {
        status: 'configured',
        metrics,
        backlinks,
        riskAssessment: backlinks.length ? evaluateBacklinkRisk(backlinks) : null,
        provider: this.name,
        isLive: true,
        configured: true,
      };
    } catch {
      return {
        status: 'not_configured',
        metrics: null,
        backlinks: [],
        riskAssessment: null,
        provider: this.name,
        isLive: false,
        configured: false,
        message: 'Không thể kết nối DataForSEO API',
      };
    }
  }
}

export class AhrefsAdapter implements BacklinkProvider {
  id = 'ahrefs';
  name = 'Ahrefs';
  isConfigured(): boolean {
    return false;
  }
  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    return {
      status: 'not_configured',
      metrics: null,
      backlinks: [],
      riskAssessment: null,
      provider: this.name,
      isLive: false,
      configured: false,
      message: 'Ahrefs backlink API integration is not implemented.',
    };
  }
}

export class SemrushAdapter implements BacklinkProvider {
  id = 'semrush';
  name = 'Semrush';
  isConfigured(): boolean {
    return false;
  }
  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    return {
      status: 'not_configured',
      metrics: null,
      backlinks: [],
      riskAssessment: null,
      provider: this.name,
      isLive: false,
      configured: false,
      message: 'Semrush backlink API integration is not implemented.',
    };
  }
}

export class MozAdapter implements BacklinkProvider {
  id = 'moz';
  name = 'Moz';
  isConfigured(): boolean {
    return false;
  }
  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    return {
      status: 'not_configured',
      metrics: null,
      backlinks: [],
      riskAssessment: null,
      provider: this.name,
      isLive: false,
      configured: false,
      message: 'Moz backlink API integration is not implemented.',
    };
  }
}

export class MajesticAdapter implements BacklinkProvider {
  id = 'majestic';
  name = 'Majestic';
  isConfigured(): boolean {
    return false;
  }
  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    return {
      status: 'not_configured',
      metrics: null,
      backlinks: [],
      riskAssessment: null,
      provider: this.name,
      isLive: false,
      configured: false,
      message: 'Majestic backlink API integration is not implemented.',
    };
  }
}

export class NoneBacklinkAdapter implements BacklinkProvider {
  id = 'none';
  name = 'None';
  isConfigured(): boolean {
    return false;
  }
  async fetchBacklinks(domain: string, options?: BacklinkFilterOptions): Promise<BacklinkProviderResponse> {
    return {
      status: 'not_configured',
      metrics: null,
      backlinks: [],
      riskAssessment: null,
      provider: 'None',
      isLive: false,
      configured: false,
      message: 'Chưa kết nối nguồn dữ liệu backlink',
    };
  }
}

// Registry of supported backlink providers
export const backlinkProviders: Record<string, BacklinkProvider> = {
  none: new NoneBacklinkAdapter(),
  dataforseo: new DataForSeoAdapter(),
  ahrefs: new AhrefsAdapter(),
  semrush: new SemrushAdapter(),
  moz: new MozAdapter(),
  majestic: new MajesticAdapter(),
};

export function getActiveBacklinkProvider(providerId?: string): BacklinkProvider {
  const chosen = (providerId || process.env.BACKLINK_PROVIDER || 'none').toLowerCase();
  return backlinkProviders[chosen] || backlinkProviders.none;
}
