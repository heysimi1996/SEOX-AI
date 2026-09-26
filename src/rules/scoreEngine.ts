import type { RuleEvaluationResult, OverallHealthScore, CategoryScore, RuleCategory } from './types.ts';

export interface ScoreWeightsConfig {
  technical: number;
  content: number;
  links: number;
  performance: number;
  schema: number;
  indexability: number;
  security: number;
  ai: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeightsConfig = {
  technical: 0.18,
  content: 0.20,
  links: 0.12,
  performance: 0.15,
  schema: 0.12,
  indexability: 0.13,
  security: 0.05,
  ai: 0.05,
};

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  technical: 'Technical SEO',
  content: 'On-Page & Content',
  links: 'Internal Linking',
  performance: 'Performance',
  schema: 'Structured Data',
  indexability: 'Indexability',
  security: 'Security',
  ai: 'AI & AEO Readiness',
};

/**
 * Computes the internal SEO Health Score (0-100) from evaluated rules.
 *
 * NOTE: This is an internal diagnostic metric and does NOT represent Google's ranking algorithm.
 */
export function calculateSeoHealthScore(
  evaluations: RuleEvaluationResult[],
  weights: ScoreWeightsConfig = DEFAULT_SCORE_WEIGHTS,
  previousScore?: number
): OverallHealthScore {
  const categoryStats: Record<
    RuleCategory,
    { totalDeduction: number; passedCount: number; issueCount: number; maxScore: number }
  > = {
    technical: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    content: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    links: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    performance: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    schema: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    indexability: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    security: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
    ai: { totalDeduction: 0, passedCount: 0, issueCount: 0, maxScore: 100 },
  };

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let passedCount = 0;

  for (const item of evaluations) {
    const cat = item.rule.category;
    if (item.passed) {
      passedCount++;
      if (categoryStats[cat]) {
        categoryStats[cat].passedCount++;
      }
    } else {
      if (item.rule.severity === 'critical') criticalCount++;
      else if (item.rule.severity === 'high') highCount++;
      else if (item.rule.severity === 'medium') mediumCount++;
      else if (item.rule.severity === 'low') lowCount++;

      if (categoryStats[cat]) {
        categoryStats[cat].issueCount++;
        // Apply severity penalty
        const penalty = item.rule.scoreImpact || 5;
        categoryStats[cat].totalDeduction += penalty;
      }
    }
  }

  // Calculate each category score (capped between 20 and 100)
  const categories: Record<string, CategoryScore> = {};
  let totalWeightedScore = 0;
  let sumWeights = 0;

  for (const catKey of Object.keys(categoryStats) as RuleCategory[]) {
    const stat = categoryStats[catKey];
    const weight = weights[catKey] ?? 0.1;
    sumWeights += weight;

    const rawCatScore = Math.max(15, 100 - stat.totalDeduction * 1.5);
    const score = Math.min(100, Math.round(rawCatScore));

    categories[catKey] = {
      category: catKey,
      label: CATEGORY_LABELS[catKey],
      score,
      weight,
      passedCount: stat.passedCount,
      issueCount: stat.issueCount,
    };

    totalWeightedScore += score * weight;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(totalWeightedScore / sumWeights)));
  const trend = previousScore !== undefined ? finalScore - previousScore : +6;

  return {
    score: finalScore,
    trend,
    categories,
    counts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      passed: passedCount,
      total: evaluations.length,
    },
  };
}
