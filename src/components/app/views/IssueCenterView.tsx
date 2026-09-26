import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Code2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
} from 'lucide-react';
import { RuleEvaluationResult, RuleSeverity, RuleCategory } from '@/src/rules/types';

interface IssueCenterViewProps {
  evaluations: RuleEvaluationResult[];
  onOpenFix: (ruleId: string, ruleName: string, category: string, snippet?: string) => void;
  onExplainWithAi: (issue: RuleEvaluationResult) => void;
}

export const IssueCenterView: React.FC<IssueCenterViewProps> = ({
  evaluations,
  onOpenFix,
  onExplainWithAi,
}) => {
  const [selectedTab, setSelectedTab] = useState<RuleSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<RuleCategory | 'all'>('all');
  const [expandedUrlsId, setExpandedUrlsId] = useState<string | null>(null);

  const tabs: Array<{ id: RuleSeverity | 'all'; label: string }> = [
    { id: 'all', label: 'All Issues' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
    { id: 'passed', label: 'Passed' },
  ];

  const categories: Array<{ id: RuleCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Categories' },
    { id: 'technical', label: 'Technical' },
    { id: 'content', label: 'Content' },
    { id: 'links', label: 'Links' },
    { id: 'performance', label: 'Performance' },
    { id: 'schema', label: 'Schema' },
    { id: 'indexability', label: 'Indexability' },
    { id: 'security', label: 'Security' },
  ];

  const filtered = evaluations.filter((item) => {
    // Tab filter
    if (selectedTab === 'passed') {
      if (!item.passed) return false;
    } else if (selectedTab !== 'all') {
      if (item.passed || item.rule.severity !== selectedTab) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && item.rule.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Algorithmic Diagnostic Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Issue Center & Code Remediation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Prioritize technical anomalies, inspect empirical crawl evidence, and generate instant
            ready-to-commit code patches powered by Gemini AI reasoning.
          </p>
        </div>

        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedTab === tab.id
                  ? 'bg-[#FF5E00] text-white font-bold shadow-md shadow-[#FF5E00]/25'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-neutral-800 text-white border border-white/[0.18]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Cards Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
          <span>Showing {filtered.length} Issue Checkpoints</span>
          <span className="font-mono">Real-time Rule Engine Matrix</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0F0F0F] border border-white/[0.06] text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">No Issues Found in this Category</div>
            <div className="text-xs text-neutral-400">All evaluated rules passed successfully.</div>
          </div>
        ) : (
          filtered.map((item) => {
            const isUrlsExpanded = expandedUrlsId === item.rule.id;
            return (
              <div
                key={item.rule.id}
                className="rounded-3xl bg-[#111111] border border-white/[0.08] p-6 hover:border-white/[0.18] transition-all shadow-xl space-y-4 group"
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {item.passed ? (
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Passed
                      </span>
                    ) : item.rule.severity === 'critical' ? (
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        Critical
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FF5E00]/10 text-[#FF8A3D] border border-[#FF5E00]/20">
                        {item.rule.severity}
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-neutral-400">
                      {item.rule.id}
                    </span>
                    <span className="text-xs text-neutral-400 capitalize">
                      · {item.rule.category}
                    </span>
                    <span className="text-xs font-medium text-neutral-400">
                      · {item.affectedCount} page{item.affectedCount !== 1 ? 's' : ''} affected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Impact:</span>
                    <span
                      className={`text-xs font-bold uppercase ${
                        item.rule.impact === 'critical'
                          ? 'text-red-400'
                          : item.rule.impact === 'high'
                          ? 'text-[#FF8A3D]'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.rule.impact}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-white">
                  {item.rule.name}
                </h3>

                {/* Empirical Evidence */}
                <div className="text-xs text-neutral-300 bg-[#0A0A0A] p-3 rounded-xl border border-white/[0.04]">
                  <strong className="text-neutral-400">Evidence: </strong>
                  <span>{item.evidence}</span>
                </div>

                {/* Why it matters */}
                <div className="text-xs text-neutral-300">
                  <strong className="text-neutral-400">Why it matters: </strong>
                  <span>{item.whyItMatters}</span>
                </div>

                {/* Recommended fix */}
                <div className="text-xs text-neutral-300">
                  <strong className="text-[#FF8A3D]">Recommended fix: </strong>
                  <span>{item.recommendedFix}</span>
                </div>

                {/* Expanded URLs list */}
                {isUrlsExpanded && item.affectedUrls.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#080808] border border-white/[0.06] text-xs font-mono space-y-1">
                    <div className="text-neutral-400 text-[10px] uppercase font-bold">
                      Affected URLs:
                    </div>
                    {item.affectedUrls.map((u: string, i: number) => (
                      <div key={i} className="text-white truncate">
                        • {u}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      setExpandedUrlsId(isUrlsExpanded ? null : item.rule.id)
                    }
                    className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>View URLs ({item.affectedUrls.length})</span>
                    {isUrlsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onExplainWithAi(item)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
                      <span>Explain with AI</span>
                    </button>

                    <button
                      onClick={() =>
                        onOpenFix(
                          item.rule.id,
                          item.rule.name,
                          item.rule.category,
                          item.suggestedPatch
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6D1A] flex items-center gap-1.5 transition-all shadow-md shadow-[#FF5E00]/20 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Generate Fix</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
