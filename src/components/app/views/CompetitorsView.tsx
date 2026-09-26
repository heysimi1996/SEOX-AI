/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Globe,
  FileCode,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  BarChart2,
} from 'lucide-react';

interface CompetitorsViewProps {
  currentDomain?: string;
}

export const CompetitorsView: React.FC<CompetitorsViewProps> = ({ currentDomain = 'https://yourwebsite.com' }) => {
  const cleanTarget = currentDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitorsList, setCompetitorsList] = useState<string[]>([
    'ahrefs.com',
    'semrush.com',
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = competitorInput.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (!clean) return;
    if (competitorsList.includes(clean)) return;
    if (competitorsList.length >= 4) return;

    setCompetitorsList([...competitorsList, clean]);
    setCompetitorInput('');
  };

  const handleRemoveCompetitor = (dom: string) => {
    setCompetitorsList(competitorsList.filter((c) => c !== dom));
  };

  const handleRunAnalysis = async () => {
    if (competitorsList.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDomain: cleanTarget,
          competitors: competitorsList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to benchmark competitors');
      }

      setAnalysisResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Multi-Domain Benchmarking
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Competitor Intelligence & Content Gap</h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Conduct live technical and semantic comparisons against rival websites. Identify missing topics, heading depth, schema entity coverage, and latency differentials.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || competitorsList.length === 0}
            className="px-6 py-3 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(255,94,0,0.3)] disabled:opacity-50 flex items-center gap-2 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crawling Competitors...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Benchmark Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPETITOR DOMAIN INPUT BAR */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Target Competitors (Up to 4)
            </h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              Primary domain: <strong className="text-white font-mono">{cleanTarget}</strong>
            </p>
          </div>

          <form onSubmit={handleAddCompetitor} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              placeholder="competitor.com"
              disabled={competitorsList.length >= 4}
              className="bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5E00] font-mono"
            />
            <button
              type="submit"
              disabled={competitorsList.length >= 4}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* Competitor Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {competitorsList.map((comp) => (
            <div
              key={comp}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 flex items-center gap-2 text-xs font-mono text-white"
            >
              <span>{comp}</span>
              <button
                onClick={() => handleRemoveCompetitor(comp)}
                className="text-neutral-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {competitorsList.length === 0 && (
            <span className="text-xs text-neutral-500 italic">No competitors configured. Add at least one to compare.</span>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* ANALYSIS RESULTS */}
      {analysisResult && (
        <div className="space-y-6">
          {/* 1. COMPETITOR BENCHMARK MATRIX */}
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Competitor Benchmark Matrix</h3>
                <p className="text-xs text-neutral-400">
                  Direct side-by-side comparison of technical architecture, speed, content weight, and schema markup.
                </p>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                Speed Leader: <span className="text-[#FF8A3D] font-bold">{analysisResult.benchmarks?.speedLeader}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                    <th className="pb-3 font-semibold">Domain</th>
                    <th className="pb-3 font-semibold text-right">SEO Health</th>
                    <th className="pb-3 font-semibold text-right">Response Time</th>
                    <th className="pb-3 font-semibold text-center">SSL / HTTPS</th>
                    <th className="pb-3 font-semibold text-right">Word Count</th>
                    <th className="pb-3 font-semibold text-right">H1 / H2 Headings</th>
                    <th className="pb-3 font-semibold text-right">Schema Types</th>
                    <th className="pb-3 font-semibold text-right">Internal Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Target Row */}
                  <tr className="bg-[#FF5E00]/5 font-bold">
                    <td className="py-3.5 font-sans text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF5E00]" />
                      <span>{analysisResult.target?.domain}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FF5E00] text-white font-sans font-bold">
                        Your Site
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-[#FF8A3D] text-sm">
                      {analysisResult.target?.healthScore || 0}/100
                    </td>
                    <td className="py-3.5 text-right text-neutral-200">
                      {analysisResult.target?.responseTimeMs || 0}ms
                    </td>
                    <td className="py-3.5 text-center">
                      {analysisResult.target?.isHttps ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 text-right text-neutral-200">
                      {analysisResult.target?.wordCount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 text-right text-neutral-200">
                      {analysisResult.target?.h1Count || 0} / {analysisResult.target?.h2Count || 0}
                    </td>
                    <td className="py-3.5 text-right text-neutral-200">
                      {analysisResult.target?.schemaTypes?.length || 0}
                    </td>
                    <td className="py-3.5 text-right text-neutral-200">
                      {analysisResult.target?.internalLinksCount || 0}
                    </td>
                  </tr>

                  {/* Competitor Rows */}
                  {analysisResult.competitors?.map((comp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-sans text-neutral-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        <span>{comp.domain}</span>
                      </td>
                      <td className="py-3 text-right text-neutral-200">
                        {comp.success ? `${comp.healthScore}/100` : '—'}
                      </td>
                      <td className="py-3 text-right text-neutral-300">
                        {comp.success ? `${comp.responseTimeMs}ms` : 'Timeout'}
                      </td>
                      <td className="py-3 text-center">
                        {comp.isHttps ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 text-right text-neutral-300">
                        {comp.wordCount?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 text-right text-neutral-300">
                        {comp.h1Count || 0} / {comp.h2Count || 0}
                      </td>
                      <td className="py-3 text-right text-neutral-300">
                        {comp.schemaTypes?.length || 0}
                      </td>
                      <td className="py-3 text-right text-neutral-300">
                        {comp.internalLinksCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CONTENT GAP ANALYSIS */}
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <Target className="w-3.5 h-3.5" />
                Topical Deficit
              </span>
              <h3 className="text-base font-bold text-white">Content Gap Analysis</h3>
              <p className="text-xs text-neutral-400 mt-1">
                High-frequency topical phrases and entities found in competitor titles, headings, and body copy that are currently absent from your site.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                    <th className="pb-3 font-semibold">Missing Topical Phrase</th>
                    <th className="pb-3 font-semibold text-right">Competitor Frequency</th>
                    <th className="pb-3 font-semibold">Competitors Covering</th>
                    <th className="pb-3 font-semibold text-center">Impact</th>
                    <th className="pb-3 font-semibold font-sans">Remediation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {analysisResult.contentGap?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500 font-sans">
                        No major topical gaps identified against evaluated competitors.
                      </td>
                    </tr>
                  ) : (
                    analysisResult.contentGap?.map((gap: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-sans text-white font-medium">"{gap.term}"</td>
                        <td className="py-3 text-right text-[#FF8A3D] font-bold">{gap.competitorFrequency}x</td>
                        <td className="py-3 font-sans text-neutral-300">
                          {gap.competitorsCovering.join(', ')}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              gap.potentialTrafficImpact === 'High'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {gap.potentialTrafficImpact}
                          </span>
                        </td>
                        <td className="py-3 font-sans text-neutral-400">
                          {gap.recommendation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. COMMON KEYWORDS & KEYWORD OPPORTUNITIES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Keywords */}
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Common Keywords (Direct Head-to-Head)</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Shared topical targets where both your site and competitors compete directly.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                      <th className="pb-2.5 font-semibold">Keyword</th>
                      <th className="pb-2.5 font-semibold text-right">Your Count</th>
                      <th className="pb-2.5 font-semibold text-right">Competitor</th>
                      <th className="pb-2.5 font-semibold text-right font-sans">Leader</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {analysisResult.commonKeywords?.slice(0, 8).map((k: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-sans text-neutral-200">{k.term}</td>
                        <td className="py-2.5 text-right text-white font-bold">{k.targetCount}x</td>
                        <td className="py-2.5 text-right text-neutral-400">{k.competitorCount}x</td>
                        <td className="py-2.5 text-right font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              k.leader === cleanTarget
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {k.leader}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Keyword Opportunities */}
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Keyword Opportunities</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Recommended entities to incorporate into your primary template structure.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                      <th className="pb-2.5 font-semibold">Entity Term</th>
                      <th className="pb-2.5 font-semibold text-right">Relevance</th>
                      <th className="pb-2.5 font-semibold font-sans">Intent</th>
                      <th className="pb-2.5 font-semibold font-sans">Suggested Placement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {analysisResult.keywordOpportunities?.slice(0, 8).map((opp: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-sans text-white font-medium">{opp.term}</td>
                        <td className="py-2.5 text-right text-[#FF8A3D] font-bold">{opp.relevanceScore}%</td>
                        <td className="py-2.5 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-neutral-300">
                            {opp.intent}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans text-neutral-400 text-[11px]">
                          {opp.suggestedPlacement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
