import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Layers,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
} from 'lucide-react';
import { PageAuditData } from '@/src/rules/types';

interface FullSiteAuditViewProps {
  currentDomain: string;
  onSelectPage: (page: any) => void;
}

export const FullSiteAuditView: React.FC<FullSiteAuditViewProps> = ({
  currentDomain,
  onSelectPage,
}) => {
  const [domainInput, setDomainInput] = useState(currentDomain);
  const [crawlLimit, setCrawlLimit] = useState<number>(50);
  const [activeCrawlId, setActiveCrawlId] = useState<string | null>(null);
  const [crawlState, setCrawlState] = useState<{
    status: 'idle' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    pagesFound: number;
    pagesProcessed: number;
    limit: number;
    errorsCount: number;
    warningsCount: number;
    passedCount: number;
    pages: any[];
  }>({
    status: 'idle',
    pagesFound: 0,
    pagesProcessed: 0,
    limit: 50,
    errorsCount: 0,
    warningsCount: 0,
    passedCount: 0,
    pages: [],
  });

  const limits = [10, 50, 100, 500, 1000];

  // Start crawl
  const handleStartCrawl = async () => {
    try {
      setCrawlState((prev) => ({
        ...prev,
        status: 'queued',
        pagesProcessed: 0,
        pagesFound: 1,
        errorsCount: 0,
        warningsCount: 0,
        passedCount: 0,
        pages: [],
      }));

      const res = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput, limit: crawlLimit }),
      });

      const data = await res.json();
      if (res.ok && data.crawlId) {
        setActiveCrawlId(data.crawlId);
      }
    } catch {
      setCrawlState((prev) => ({ ...prev, status: 'failed' }));
    }
  };

  // Cancel crawl
  const handleCancelCrawl = async () => {
    if (!activeCrawlId) return;
    try {
      await fetch(`/api/crawler/cancel/${activeCrawlId}`, { method: 'POST' });
      setCrawlState((prev) => ({ ...prev, status: 'cancelled' }));
    } catch {
      // ignore
    }
  };

  // Poll status while running or queued
  useEffect(() => {
    if (!activeCrawlId) return;
    if (crawlState.status === 'completed' || crawlState.status === 'cancelled' || crawlState.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/crawler/status/${activeCrawlId}`);
        if (res.ok) {
          const session = await res.json();
          setCrawlState({
            status: session.status,
            pagesFound: session.pagesFound,
            pagesProcessed: session.pagesProcessed,
            limit: session.limit,
            errorsCount: session.errorsCount,
            warningsCount: session.warningsCount,
            passedCount: session.passedCount,
            pages: session.pages || [],
          });

          if (session.status === 'completed' || session.status === 'failed' || session.status === 'cancelled') {
            clearInterval(interval);
          }
        }
      } catch {
        // error polling
      }
    }, 800);

    return () => clearInterval(interval);
  }, [activeCrawlId, crawlState.status]);

  const percent = crawlState.limit > 0
    ? Math.min(100, Math.round((crawlState.pagesProcessed / crawlState.limit) * 100))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Configuration Header */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-5">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Autonomous Crawler Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Full Site Audit & Queue Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Recursively crawls internal pathways, respects robots.txt directives, maps canonical hierarchies,
            and detects orphan pages across enterprise URL limits.
          </p>
        </div>

        {/* Input & Limit Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 bg-[#080808] p-2 rounded-2xl border border-white/[0.12] flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 pl-2">Root:</span>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-transparent text-white font-mono text-sm focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-1.5 bg-[#080808] p-2 rounded-2xl border border-white/[0.12] justify-center text-xs">
            <span className="text-neutral-500 text-[11px] font-medium mr-1">Limit:</span>
            {limits.map((lim) => (
              <button
                key={lim}
                onClick={() => setCrawlLimit(lim)}
                className={`px-2 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                  crawlLimit === lim
                    ? 'bg-[#FF5E00] text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lim}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            {crawlState.status === 'running' || crawlState.status === 'queued' ? (
              <button
                onClick={handleCancelCrawl}
                className="w-full h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Cancel Crawl</span>
              </button>
            ) : (
              <button
                onClick={handleStartCrawl}
                className="w-full h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FF5E00] hover:bg-[#FF6D1A] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#FF5E00]/25"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Crawl</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Queue Progress & Counters */}
      {(crawlState.status !== 'idle' || crawlState.pages.length > 0) && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    crawlState.status === 'running'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : crawlState.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400 border-white/[0.06]'
                  }`}
                >
                  {crawlState.status}
                </span>
                <span className="text-xs text-neutral-400">
                  Target Domain: <strong className="text-white font-mono">{domainInput}</strong>
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                Progress: {crawlState.pagesProcessed} / {crawlState.limit} URLs Crawled
              </div>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-[#141414] border border-red-500/30 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Errors</div>
                <div className="text-lg font-bold font-mono text-red-400">{crawlState.errorsCount}</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#141414] border border-[#FF5E00]/30 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Warnings</div>
                <div className="text-lg font-bold font-mono text-[#FF8A3D]">{crawlState.warningsCount}</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#141414] border border-emerald-500/30 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Passed</div>
                <div className="text-lg font-bold font-mono text-emerald-400">{crawlState.passedCount}</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-neutral-400">
              <span>CRAWL QUEUE COMPLETION</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#FF5E00] to-[#FFA726] rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Crawled Pages Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
              <span>Discovered & Processed URLs ({crawlState.pages.length})</span>
              <span>Click any URL to drill into /pages/[id]</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-neutral-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="p-3 font-semibold">URL Path</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Depth</th>
                    <th className="p-3 font-semibold">Latency</th>
                    <th className="p-3 font-semibold">SEO Score</th>
                    <th className="p-3 font-semibold">Issues</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-[#0A0A0A]">
                  {crawlState.pages.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPage(p)}
                      className="hover:bg-[#141414] transition-colors cursor-pointer group"
                    >
                      <td className="p-3 font-mono text-white truncate max-w-xs">{p.url}</td>
                      <td className="p-3 font-mono text-emerald-400">{p.status} OK</td>
                      <td className="p-3 font-mono text-neutral-400">{p.depth} hops</td>
                      <td className="p-3 font-mono text-neutral-300">{p.responseTimeMs}ms</td>
                      <td className="p-3 font-mono font-bold text-[#FF8A3D]">{p.score}</td>
                      <td className="p-3 font-mono text-neutral-400">{p.issuesCount} found</td>
                      <td className="p-3 text-right">
                        <span className="text-[#FF8A3D] group-hover:underline text-[11px] font-semibold">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
