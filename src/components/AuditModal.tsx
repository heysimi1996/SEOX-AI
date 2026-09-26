import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, ArrowUpRight, Download, RefreshCw, ShieldCheck, Zap, Globe, FileCode } from 'lucide-react';
import { DomainAuditReport } from '../types/seo';
import { PRESET_AUDIT_DOMAINS, DEMO_ISSUES } from '../data/seoData';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
}) => {
  const [crawlStage, setCrawlStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reportData, setReportData] = useState<DomainAuditReport | null>(null);

  const cleanDomain = targetUrl
    ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    : 'example.com';

  const crawlSteps = [
    { title: 'Connecting to host', detail: 'DNS resolution, TLS 1.3 verification & HTTP/3 handshake' },
    { title: 'Autonomous DOM Spider', detail: 'Crawling HTML, canonical links, robots.txt & XML sitemaps' },
    { title: 'Core Web Vitals synthetic lab', detail: 'Simulating mobile & desktop viewport rendering (LCP, INP, CLS)' },
    { title: 'Content & Semantic Intelligence', detail: 'Extracting entity graph, keyword clusters & heading structure' },
    { title: 'Schema & LLM Discoverability', detail: 'Testing JSON-LD structure & AI model citation readiness' },
    { title: 'Synthesizing Copilot Roadmap', detail: 'Generating prioritized code fixes and executive action items' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCrawlStage(0);
      setIsFinished(false);
      return;
    }

    // Check if preset domain exists or generate dynamic demo data
    const matched = PRESET_AUDIT_DOMAINS.find((p) => cleanDomain.includes(p.domain));
    const finalReport: DomainAuditReport = matched || {
      domain: cleanDomain,
      healthScore: 88,
      totalPagesScanned: 1284,
      scanDuration: '3.8s',
      timestamp: 'Just now',
      scores: {
        technical: 92,
        content: 84,
        performance: 79,
        indexability: 95,
        aiDiscoverability: 82,
      },
      issueCounts: {
        critical: 2,
        high: 6,
        warning: 14,
        passed: 112,
      },
      topIssues: DEMO_ISSUES.slice(0, 3),
    };
    setReportData(finalReport);

    // Run stages
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < crawlSteps.length) {
        setCrawlStage(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => setIsFinished(true), 400);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, cleanDomain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0E0E0E] border border-white/[0.12] rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#121212]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF5E00]/15 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{cleanDomain}</span>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800/80 px-1.5 py-0.5 rounded border border-white/[0.06]">
                  DEMO AUDIT
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                {isFinished ? 'Audit Completed in 3.8s' : 'Deep Technical Crawl in progress...'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
            aria-label="Close audit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isFinished ? (
            /* Crawling Progression View */
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>SIMULATED AUDIT PROGRESS</span>
                <span>{Math.round(((crawlStage + 1) / crawlSteps.length) * 100)}%</span>
              </div>

              {/* Top progress bar */}
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5E00] to-[#FFA726] rounded-full transition-all duration-300"
                  style={{ width: `${((crawlStage + 1) / crawlSteps.length) * 100}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="space-y-3">
                {crawlSteps.map((step, idx) => {
                  const isDone = idx < crawlStage;
                  const isActive = idx === crawlStage;

                  return (
                    <div
                      key={step.title}
                      className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                        isActive
                          ? 'bg-[#181818] border-[#FF5E00]/50 shadow-lg shadow-[#FF5E00]/10'
                          : isDone
                          ? 'bg-[#101010]/70 border-white/[0.06] opacity-75'
                          : 'bg-[#0B0B0B] border-white/[0.03] opacity-35'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[#FF5E00] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white">{step.title}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{step.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Completed Audit Results View */
            reportData && (
              <div className="space-y-6">
                {/* Score Header Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181818] to-[#121212] border border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                      Calculated Health Index
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-black font-mono text-white tabular-nums">
                        {reportData.healthScore}
                      </span>
                      <span className="text-xl font-medium font-mono text-neutral-500">/ 100</span>
                      <span className="ml-3 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Top 8% of Crawled Domains
                      </span>
                    </div>
                  </div>

                  {/* Summary metric tags */}
                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-2 rounded-xl bg-neutral-900 border border-white/[0.06]">
                      <div className="text-xs text-neutral-400">Scanned</div>
                      <div className="text-sm font-bold font-mono text-white">
                        {reportData.totalPagesScanned.toLocaleString()} URLs
                      </div>
                    </div>
                    <div className="text-center px-3 py-2 rounded-xl bg-neutral-900 border border-white/[0.06]">
                      <div className="text-xs text-neutral-400">Duration</div>
                      <div className="text-sm font-bold font-mono text-white">{reportData.scanDuration}</div>
                    </div>
                  </div>
                </div>

                {/* Score breakdown pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {Object.entries(reportData.scores).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-[#121212] border border-white/[0.06]">
                      <div className="text-[11px] text-neutral-400 capitalize truncate">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{val}</div>
                      <div className="h-1 w-full bg-neutral-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-[#FF5E00] rounded-full"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Issues Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                    <span>Critical Issues Requiring Attention</span>
                    <span className="font-mono text-neutral-500">
                      {reportData.issueCounts.critical} Critical · {reportData.issueCounts.high} High
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {reportData.topIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-4 rounded-xl bg-[#121212] border border-white/[0.08] hover:border-[#FF5E00]/40 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          {issue.severity === 'critical' ? (
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white">{issue.title}</div>
                            <div className="text-[11px] text-neutral-400 mt-1">{issue.impact}</div>
                            <div className="mt-2 text-[11px] text-neutral-300 bg-neutral-900/90 p-2.5 rounded-lg border border-white/[0.04]">
                              <span className="text-[#FF8A3D] font-semibold">Recommended Fix: </span>
                              {issue.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#121212]/90 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Export full technical report or connect Google Search Console.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                alert(`Exporting SEO audit report for ${cleanDomain}... Download started.`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6E1A] transition-colors shadow-md shadow-[#FF5E00]/25 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
