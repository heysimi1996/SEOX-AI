/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, type Request, type Response } from 'express';
import { auditSingleUrl } from '../crawler.ts';
import { evaluatePageRules } from '../../src/rules/rulesRegistry.ts';
import { calculateSeoHealthScore } from '../../src/rules/scoreEngine.ts';
import { validateSafeUrl } from '../security.ts';

export const competitorsRouter = Router();

// Helper to extract top keywords & bi-grams from text
function extractTopKeywords(text: string, title: string, headings: string[]): Array<{ term: string; count: number }> {
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'have', 'more', 'will', 'about',
    'what', 'when', 'which', 'their', 'there', 'they', 'been', 'were', 'also', 'into', 'some',
    'than', 'them', 'then', 'these', 'only', 'other', 'over', 'such', 'after', 'also', 'back',
  ]);

  const combined = `${title} ${headings.join(' ')} ${text}`.toLowerCase();
  const words = combined.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  // Also bi-grams
  for (let i = 0; i < words.length - 1; i++) {
    const bi = `${words[i]} ${words[i + 1]}`;
    if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      freq[bi] = (freq[bi] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([term, count]) => ({ term, count }));
}

competitorsRouter.post('/analyze', async (req: Request, res: Response) => {
  const { targetDomain, competitors } = req.body;

  if (!targetDomain || typeof targetDomain !== 'string') {
    return res.status(400).json({ error: 'targetDomain is required' });
  }

  if (!Array.isArray(competitors) || competitors.length === 0) {
    return res.status(400).json({ error: 'competitors must be an array of domain strings' });
  }

  const cleanTarget = targetDomain.trim();
  const cleanCompetitors = competitors
    .map((c) => (typeof c === 'string' ? c.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);

  const allDomains = [cleanTarget, ...cleanCompetitors];

  try {
    // Audit each domain in parallel with SSRF checks
    const auditPromises = allDomains.map(async (domain) => {
      let url = domain;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const safe = await validateSafeUrl(url);
      if (!safe.safe) {
        return {
          domain,
          url,
          success: false,
          error: safe.error || 'Blocked by security policy',
        };
      }

      try {
        const pageData = await auditSingleUrl(url);
        const evals = evaluatePageRules(pageData);
        const health = calculateSeoHealthScore(evals);

        const headingsList = [
          ...pageData.headings.h1,
          ...pageData.headings.h2,
          ...pageData.headings.h3,
        ];
        const keywords = extractTopKeywords(pageData.metaDescription || '', pageData.title || '', headingsList);

        const totalHeadings =
          pageData.headings.h1.length +
          pageData.headings.h2.length +
          pageData.headings.h3.length +
          pageData.headings.h4.length +
          pageData.headings.h5.length +
          pageData.headings.h6.length;

        return {
          domain,
          url: pageData.url,
          success: true,
          healthScore: health.score,
          responseTimeMs: pageData.responseTimeMs,
          isHttps: pageData.isHttps,
          title: pageData.title,
          wordCount: pageData.wordCount,
          headingsCount: totalHeadings,
          h1Count: pageData.headings.h1.length,
          h2Count: pageData.headings.h2.length,
          schemaTypes: pageData.jsonLd.flatMap(j => j.types),
          internalLinksCount: pageData.links.totalInternal,
          externalLinksCount: pageData.links.totalExternal,
          imagesCount: pageData.images.length,
          imagesWithoutAlt: pageData.images.filter(i => !i.hasAlt).length,
          keywords,
          rawPageData: pageData,
        };
      } catch (err: any) {
        return {
          domain,
          url,
          success: false,
          error: err?.message || 'Failed to probe competitor',
        };
      }
    });

    const results = await Promise.all(auditPromises);
    const targetResult = results[0];
    const competitorResults = results.slice(1);

    // -------------------------------------------------------------
    // Content Gap Analysis & Common Keywords Computation
    // -------------------------------------------------------------
    const targetKeywordsMap = new Map<string, number>();
    if (targetResult.success && targetResult.keywords) {
      targetResult.keywords.forEach((k: any) => targetKeywordsMap.set(k.term, k.count));
    }

    const competitorKeywordsMap = new Map<string, { count: number; domains: string[] }>();
    competitorResults.forEach((comp) => {
      if (comp.success && comp.keywords) {
        comp.keywords.forEach((k: any) => {
          const existing = competitorKeywordsMap.get(k.term) || { count: 0, domains: [] };
          existing.count += k.count;
          if (!existing.domains.includes(comp.domain)) {
            existing.domains.push(comp.domain);
          }
          competitorKeywordsMap.set(k.term, existing);
        });
      }
    });

    // Content Gap: Keywords frequent in competitors but missing on target
    const contentGap: Array<{
      term: string;
      competitorFrequency: number;
      competitorsCovering: string[];
      recommendation: string;
      potentialTrafficImpact: 'High' | 'Medium' | 'Low';
    }> = [];

    // Common Keywords: Keywords present on both
    const commonKeywords: Array<{
      term: string;
      targetCount: number;
      competitorCount: number;
      leader: string;
    }> = [];

    // Keyword Opportunities
    const keywordOpportunities: Array<{
      term: string;
      relevanceScore: number;
      suggestedPlacement: string;
      intent: 'Commercial' | 'Informational' | 'Transactional';
    }> = [];

    for (const [term, data] of competitorKeywordsMap.entries()) {
      const targetCount = targetKeywordsMap.get(term) || 0;
      if (targetCount === 0 && data.count >= 2) {
        const impact = data.domains.length >= 2 || data.count >= 4 ? 'High' : 'Medium';
        contentGap.push({
          term,
          competitorFrequency: data.count,
          competitorsCovering: data.domains,
          recommendation: `Incorporate into dedicated H2 section or semantic schema to bridge organic gap against ${data.domains.join(', ')}.`,
          potentialTrafficImpact: impact,
        });

        keywordOpportunities.push({
          term,
          relevanceScore: Math.min(98, 70 + data.count * 4),
          suggestedPlacement: term.split(' ').length > 1 ? 'Subheadings (H2/H3) & Body paragraph' : 'Primary H1 or Title meta',
          intent: term.includes('free') || term.includes('audit') || term.includes('tool') ? 'Transactional' : 'Informational',
        });
      } else if (targetCount > 0) {
        commonKeywords.push({
          term,
          targetCount,
          competitorCount: data.count,
          leader: targetCount >= data.count ? cleanTarget : data.domains[0] || 'Competitor',
        });
      }
    }

    contentGap.sort((a, b) => b.competitorFrequency - a.competitorFrequency);
    commonKeywords.sort((a, b) => (b.targetCount + b.competitorCount) - (a.targetCount + a.competitorCount));
    keywordOpportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.json({
      target: targetResult,
      competitors: competitorResults,
      benchmarks: {
        targetScore: targetResult.success ? targetResult.healthScore : 0,
        averageCompetitorScore: competitorResults.filter(c => c.success).length
          ? Math.round(competitorResults.filter(c => c.success).reduce((a, b) => a + (b.healthScore || 0), 0) / competitorResults.filter(c => c.success).length)
          : 0,
        speedLeader: [targetResult, ...competitorResults]
          .filter(r => r.success)
          .sort((a: any, b: any) => (a.responseTimeMs ?? 9999) - (b.responseTimeMs ?? 9999))[0]?.domain || cleanTarget,
      },
      contentGap: contentGap.slice(0, 15),
      commonKeywords: commonKeywords.slice(0, 15),
      keywordOpportunities: keywordOpportunities.slice(0, 12),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Competitor benchmark analysis failed' });
  }
});
