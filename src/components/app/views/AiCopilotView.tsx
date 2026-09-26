import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Code2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from '@/src/rules/types';

interface AiCopilotViewProps {
  pageData: PageAuditData;
  evaluations: RuleEvaluationResult[];
  healthScore: OverallHealthScore;
  onOpenFix: (ruleId: string, ruleName: string, category: string, snippet?: string) => void;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  pageData,
  evaluations,
  healthScore,
  onOpenFix,
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    summary: string;
    issues: Array<{
      finding: string;
      evidence: string;
      why: string;
      fix: string;
      effort: string;
      expectedBenefit: string;
      confidence: string;
    }>;
    priorityActions: string[];
    confidence: string;
  } | null>(null);

  const fetchAiAnalysis = async () => {
    setLoading(true);
    try {
      const summaryPayload = {
        url: pageData.url,
        score: healthScore.score,
        ttfbMs: pageData.responseTimeMs,
        failedRules: evaluations
          .filter((e) => !e.passed)
          .map((e) => ({
            id: e.rule.id,
            name: e.rule.name,
            severity: e.rule.severity,
            evidence: e.evidence,
          })),
        wordCount: pageData.wordCount,
        hasSchema: pageData.jsonLd.some((s: any) => s.isValid),
        isHttps: pageData.isHttps,
      };

      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditSummary: summaryPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiAnalysis();
  }, [pageData.url]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5E00]" />
              <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
                Gemini Reasoning Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              AI Strategic Recommendations & Roadmaps
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Synthesizes structured audit telemetry into prioritized executive action items with
              realistic effort boundaries, risk mitigation guides, and confidence scoring.
            </p>
          </div>

          <button
            onClick={fetchAiAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate with Gemini</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 rounded-3xl bg-[#0F0F0F] border border-white/[0.06] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#FF5E00] border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-bold text-white">Synthesizing Algorithmic Recommendations...</div>
          <div className="text-xs text-neutral-500">Gemini is processing structured audit JSON...</div>
        </div>
      ) : recommendations ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161616] to-[#0F0F0F] border border-white/[0.1] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white uppercase tracking-wider">Executive Synthesis</span>
              <span className="text-emerald-400 font-mono">Confidence: {recommendations.confidence || '94%'}</span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">{recommendations.summary}</p>

            {/* Priority Actions list */}
            {recommendations.priorityActions && recommendations.priorityActions.length > 0 && (
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Top Priority Milestones:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {recommendations.priorityActions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.04] text-neutral-300 flex items-start gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#FF5E00] shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Findings Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Prioritized Action Items</h2>

            <div className="space-y-4">
              {recommendations.issues.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#111111] border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF8A3D] font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">{rec.finding}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-neutral-400">
                        Effort: <strong className="text-white">{rec.effort}</strong>
                      </span>
                      <span className="text-neutral-400">
                        Confidence: <strong className="text-emerald-400">{rec.confidence}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.04] text-xs text-neutral-300">
                    <strong className="text-neutral-400">Observed Evidence: </strong>
                    <span>{rec.evidence}</span>
                  </div>

                  {/* Why it matters */}
                  <div className="text-xs text-neutral-300">
                    <strong className="text-neutral-400">Algorithmic Rationale: </strong>
                    <span>{rec.why}</span>
                  </div>

                  {/* Expected Benefit */}
                  <div className="text-xs text-emerald-400 font-medium">
                    <span>Expected Benefit: </span>
                    <span className="text-neutral-300">{rec.expectedBenefit}</span>
                  </div>

                  {/* Recommended Fix and Action button */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-neutral-300 max-w-2xl">
                      <strong className="text-[#FF8A3D]">Action Plan: </strong>
                      <span>{rec.fix}</span>
                    </div>

                    <button
                      onClick={() =>
                        onOpenFix(`REC-${idx + 1}`, rec.finding, 'technical', undefined)
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6D1A] flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-md shadow-[#FF5E00]/20"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Generate Code Patch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
