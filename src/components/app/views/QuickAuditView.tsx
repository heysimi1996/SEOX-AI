import React, { useState } from 'react';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from '@/src/rules/types';

interface QuickAuditViewProps {
  pageData: PageAuditData;
  evaluations: RuleEvaluationResult[];
  healthScore: OverallHealthScore;
  onAuditComplete: (data: PageAuditData, evals: RuleEvaluationResult[], score: OverallHealthScore) => void;
  onOpenFix: (ruleId: string, ruleName: string, category: string, snippet?: string) => void;
}

export const QuickAuditView: React.FC<QuickAuditViewProps> = ({
  pageData,
  evaluations,
  healthScore,
  onAuditComplete,
  onOpenFix,
}) => {
  const [inputUrl, setInputUrl] = useState(pageData.url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'extracted' | 'json'>('rules');
  const [copiedJson, setCopiedJson] = useState(false);

  const handleRunAudit = async (urlToTest?: string) => {
    const target = (urlToTest || inputUrl).trim();
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to complete quick audit');
      }

      onAuditComplete(json.pageData, json.ruleEvaluations, json.healthScore);
    } catch (err: any) {
      setError(err?.message || 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(pageData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / URL Search Bar */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Live URL Inspector
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Real-Time Diagnostic Crawler
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Probes single endpoints with live HTTP requests, parses the full DOM tree, analyzes security
            headers, and runs the 18+ checkpoint SEO rule engine with SSRF protection.
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAudit();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#080808] p-2 rounded-2xl border border-white/[0.12] focus-within:border-[#FF5E00]/60 shadow-inner"
        >
          <div className="flex-1 flex items-center gap-3 px-3 min-w-0">
            <Globe className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/target-page"
              className="w-full bg-transparent text-white font-mono text-sm focus:outline-none placeholder-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FF5E00] hover:bg-[#FF6D1A] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF5E00]/25 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Analyze Endpoint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-200">Audit Request Blocked / Failed</div>
              <div className="mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Fast presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1">
          <span className="text-neutral-500">Live Demo Targets:</span>
          {['https://linear.app', 'https://stripe.com', 'https://vercel.com'].map((demo) => (
            <button
              key={demo}
              type="button"
              onClick={() => {
                setInputUrl(demo);
                handleRunAudit(demo);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/[0.06] font-mono text-[11px] cursor-pointer"
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {/* HTTP Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Status Code</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {pageData.status} {pageData.statusText}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Protocol</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {pageData.isHttps ? 'HTTPS / TLS' : 'Insecure HTTP'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Response Latency</div>
          <div className="text-xl font-bold font-mono text-[#FF8A3D] mt-1">
            {pageData.responseTimeMs}ms
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Word Count</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {pageData.wordCount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Internal Links</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {pageData.links.totalInternal}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-white/[0.06]">
          <div className="text-[11px] text-neutral-400 font-medium">Images Discovered</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {pageData.images.length}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Evaluated Rules vs Extracted DOM Data vs Raw JSON */}
      <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#141414] border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'rules' ? 'bg-[#1C1C1C] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Rule Evaluations ({evaluations.length})
            </button>
            <button
              onClick={() => setActiveTab('extracted')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'extracted' ? 'bg-[#1C1C1C] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Extracted DOM Data
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'json' ? 'bg-[#1C1C1C] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Structured JSON
            </button>
          </div>

          {activeTab === 'json' && (
            <button
              onClick={copyJson}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-white/[0.06]"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Rules Evaluation */}
        {activeTab === 'rules' && (
          <div className="p-6 space-y-3">
            {evaluations.map((evalItem) => (
              <div
                key={evalItem.rule.id}
                className={`p-4 rounded-2xl border transition-all ${
                  evalItem.passed
                    ? 'bg-[#121212]/60 border-white/[0.05]'
                    : evalItem.rule.severity === 'critical'
                    ? 'bg-red-950/15 border-red-500/30'
                    : 'bg-[#141414] border-white/[0.08]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {evalItem.passed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : evalItem.rule.severity === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          {evalItem.rule.id}
                        </span>
                        <span className="text-xs font-bold text-white">{evalItem.rule.name}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            evalItem.passed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-[#FF5E00]/10 text-[#FF8A3D] border-[#FF5E00]/20'
                          }`}
                        >
                          {evalItem.passed ? 'PASSED' : evalItem.rule.severity}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400">{evalItem.evidence}</div>
                      {!evalItem.passed && (
                        <div className="text-xs text-neutral-300 pt-1">
                          <span className="text-[#FF8A3D] font-semibold">Recommended Fix: </span>
                          {evalItem.recommendedFix}
                        </div>
                      )}
                    </div>
                  </div>

                  {!evalItem.passed && (
                    <button
                      onClick={() =>
                        onOpenFix(
                          evalItem.rule.id,
                          evalItem.rule.name,
                          evalItem.rule.category,
                          evalItem.suggestedPatch
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-[#FF5E00]/40 flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#FF5E00]" />
                      <span>Fix Patch</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Extracted DOM Data */}
        {activeTab === 'extracted' && (
          <div className="p-6 space-y-6 text-xs text-neutral-300">
            {/* Title & Meta Description */}
            <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider text-neutral-400">
                Document &lt;head&gt; Tags
              </div>
              <div>
                <span className="text-neutral-500 font-mono">title: </span>
                <span className="font-medium text-white">{pageData.title || '(missing)'}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-mono">meta description: </span>
                <span>{pageData.metaDescription || '(missing)'}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-mono">canonical: </span>
                <span className="font-mono text-[#FF8A3D]">{pageData.canonical || '(none)'}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-mono">robots meta: </span>
                <span className="font-mono text-emerald-400">{pageData.robotsMeta || 'index, follow'}</span>
              </div>
            </div>

            {/* Headings Structure */}
            <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider text-neutral-400">
                Heading Hierarchy Tree
              </div>
              {pageData.headings.h1.map((h: string, i: number) => (
                <div key={i} className="font-mono text-white">
                  <span className="text-[#FF5E00] font-bold">H1: </span>
                  {h}
                </div>
              ))}
              {pageData.headings.h2.map((h: string, i: number) => (
                <div key={i} className="font-mono text-neutral-300 pl-4">
                  <span className="text-neutral-500 font-bold">H2: </span>
                  {h}
                </div>
              ))}
              {pageData.headings.h3.map((h: string, i: number) => (
                <div key={i} className="font-mono text-neutral-400 pl-8">
                  <span className="text-neutral-600 font-bold">H3: </span>
                  {h}
                </div>
              ))}
            </div>

            {/* Structured Schema JSON-LD */}
            <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider text-neutral-400">
                JSON-LD Graph Definitions ({pageData.jsonLd.length})
              </div>
              {pageData.jsonLd.map((s: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[#080808] border border-white/[0.04]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400">
                    <span>Types: [{s.types.join(', ')}]</span>
                    <span>{s.isValid ? '✓ Syntax Valid' : '✕ Syntax Error'}</span>
                  </div>
                  <pre className="mt-1 font-mono text-[11px] text-neutral-400 overflow-x-auto">
                    {JSON.stringify(s.parsed, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Structured JSON */}
        {activeTab === 'json' && (
          <div className="p-6">
            <pre className="p-4 rounded-2xl bg-[#080808] border border-white/[0.08] font-mono text-xs text-neutral-300 overflow-x-auto max-h-[500px]">
              {JSON.stringify(pageData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
