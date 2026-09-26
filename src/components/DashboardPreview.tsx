import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  Search,
  Filter,
  Code2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { DEMO_ISSUES } from '../data/seoData';
import { SeoIssue } from '../types/seo';

export const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issues' | 'overview' | 'vitals' | 'schema'>('issues');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'warning' | 'passed'>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('ISSUE-01');

  const filteredIssues = DEMO_ISSUES.filter((issue) => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  return (
    <div className="w-full rounded-3xl bg-[#0D0D0D] border border-white/[0.1] shadow-2xl shadow-black overflow-hidden flex flex-col">
      {/* Top Application Bar */}
      <div className="px-5 py-3.5 bg-[#141414] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        {/* Left window indicators & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="h-4 w-[1px] bg-white/[0.1] mx-1 hidden sm:block" />

          <div className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
            <span className="text-neutral-400">audit /</span>
            <span className="font-semibold text-white">production-cluster.io</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 hidden md:inline">
              LIVE MONITORING
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-white/[0.06] text-xs">
          {(['issues', 'overview', 'vitals', 'schema'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#1C1C1C] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab === 'vitals' ? 'Core Web Vitals' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Status Bar */}
      <div className="p-6 bg-[#111111]/80 border-b border-white/[0.08] grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Main SEO Health Box */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-[#1C1C1C] to-[#141414] border border-[#FF5E00]/30 shadow-lg">
          <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            SEO Health
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">87</span>
            <span className="text-neutral-500 font-mono text-sm">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span>▲ +4 pts vs last crawl</span>
          </div>
        </div>

        {/* Critical */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
            severityFilter === 'critical'
              ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-500/10'
              : 'bg-[#141414] border-white/[0.06] hover:border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Critical</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-red-400 mt-1 tabular-nums">2</div>
          <div className="text-[11px] text-neutral-400 mt-1">Requires immediate fix</div>
        </button>

        {/* High */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
          className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
            severityFilter === 'high'
              ? 'bg-orange-950/20 border-[#FF5E00]/60 shadow-lg shadow-[#FF5E00]/10'
              : 'bg-[#141414] border-white/[0.06] hover:border-[#FF5E00]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">High</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A3D]" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#FF8A3D] mt-1 tabular-nums">8</div>
          <div className="text-[11px] text-neutral-400 mt-1">Ranking risk factor</div>
        </button>

        {/* Warnings */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
          className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
            severityFilter === 'warning'
              ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'bg-[#141414] border-white/[0.06] hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Warnings</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">17</div>
          <div className="text-[11px] text-neutral-400 mt-1">Optimization targets</div>
        </button>

        {/* Passed */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'passed' ? 'all' : 'passed')}
          className={`p-4 rounded-2xl text-left transition-all cursor-pointer border ${
            severityFilter === 'passed'
              ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
              : 'bg-[#141414] border-white/[0.06] hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Passed</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">103</div>
          <div className="text-[11px] text-neutral-400 mt-1">Validated rules</div>
        </button>
      </div>

      {/* Content Area Based on Active Tab */}
      <div className="p-6 bg-[#0E0E0E]">
        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-300">Filter Severity:</span>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {(['all', 'critical', 'high', 'warning'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-1 rounded-md capitalize cursor-pointer transition-colors ${
                        severityFilter === sev
                          ? 'bg-[#FF5E00] text-white font-bold'
                          : 'bg-[#161616] text-neutral-400 hover:text-white border border-white/[0.04]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                Showing {filteredIssues.length} issues · DEMO DATA
              </div>
            </div>

            {/* Issues List with Accordion Details */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const isExpanded = expandedIssueId === issue.id;
                return (
                  <div
                    key={issue.id}
                    className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-[#181818] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {issue.severity === 'critical' ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 shrink-0 shadow-[0_0_8px_#F87171]" />
                        ) : issue.severity === 'high' ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D] mt-1 shrink-0 shadow-[0_0_8px_#FF8A3D]" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-neutral-400">{issue.id}</span>
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                              · {issue.category}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-white mt-0.5 truncate">
                            {issue.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:block text-right">
                          <div className="text-xs font-mono font-semibold text-neutral-300">
                            {issue.affectedCount} URLs
                          </div>
                          <div className="text-[10px] text-neutral-400">affected</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-white/[0.04] bg-[#111111] space-y-3">
                        <div className="mt-3 text-xs text-neutral-300">
                          <span className="text-neutral-400 font-medium">Impact Assessment: </span>
                          {issue.impact}
                        </div>

                        <div className="p-3 rounded-xl bg-[#181818] border border-white/[0.06] text-xs">
                          <div className="text-[#FF8A3D] font-semibold flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Copilot Suggested Remediation:</span>
                          </div>
                          <div className="text-neutral-300">{issue.recommendation}</div>
                        </div>

                        {issue.codeSnippet && (
                          <div className="rounded-xl bg-[#090909] p-3 border border-white/[0.08] font-mono text-xs text-neutral-300 overflow-x-auto">
                            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Code2 className="w-3 h-3 text-[#FF5E00]" />
                              <span>Code Patch Example</span>
                            </div>
                            <code>{issue.codeSnippet}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
                <div className="text-xs text-neutral-400 uppercase font-semibold">Crawl Efficiency</div>
                <div className="text-2xl font-bold font-mono text-white mt-2">99.4%</div>
                <div className="text-xs text-neutral-400 mt-1">1,276 of 1,284 URLs indexable</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
                <div className="text-xs text-neutral-400 uppercase font-semibold">Average Page Depth</div>
                <div className="text-2xl font-bold font-mono text-white mt-2">2.4 Hops</div>
                <div className="text-xs text-neutral-400 mt-1">94% URLs within 3 clicks of root</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
                <div className="text-xs text-neutral-400 uppercase font-semibold">HTTPS / HSTS Health</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">100% Secure</div>
                <div className="text-xs text-neutral-400 mt-1">No mixed content or TLS degradation</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-xs text-neutral-400">Largest Contentful Paint (LCP)</div>
              <div className="text-2xl font-extrabold font-mono text-amber-400 mt-2">2.4s</div>
              <div className="text-xs text-neutral-400 mt-1">Needs improvement on mobile</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-xs text-neutral-400">Interaction to Next Paint (INP)</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">48ms</div>
              <div className="text-xs text-neutral-400 mt-1">Excellent responsiveness</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-xs text-neutral-400">Cumulative Layout Shift (CLS)</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">0.02</div>
              <div className="text-xs text-neutral-400 mt-1">Stable layout rendering</div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-4">
            <div className="text-sm font-bold text-white">Detected Structured Data Graphs</div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#1A1A1A] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-emerald-400">Organization</span>
                  <span className="text-neutral-400 ml-2">JSON-LD 1.1 · Valid</span>
                </div>
                <span className="text-emerald-400 font-mono">100% Complete</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1A1A1A] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-emerald-400">BreadcrumbList</span>
                  <span className="text-neutral-400 ml-2">JSON-LD 1.1 · Valid</span>
                </div>
                <span className="text-emerald-400 font-mono">14 Pages</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1A1A1A] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-[#FF8A3D]">SoftwareApplication</span>
                  <span className="text-neutral-400 ml-2">Missing offers & author properties</span>
                </div>
                <span className="text-[#FF8A3D] font-mono">Action Required</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
