import React, { useState } from 'react';
import {
  FileText,
  ArrowLeft,
  Globe,
  CheckCircle,
  AlertTriangle,
  Code2,
  ExternalLink,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { PageAuditData } from '@/src/rules/types';

interface PagesViewProps {
  selectedPage: any | null;
  onBackToList: () => void;
  defaultData: PageAuditData;
}

export const PagesView: React.FC<PagesViewProps> = ({
  selectedPage,
  onBackToList,
  defaultData,
}) => {
  const [activeTab, setActiveTab] = useState<'meta' | 'headings' | 'content' | 'links' | 'images' | 'schema' | 'performance' | 'raw'>('meta');
  const [copiedRaw, setCopiedRaw] = useState(false);

  // If a page from crawl is selected, use its data; otherwise use defaultData
  const page: PageAuditData = selectedPage?.data || defaultData;
  const pageScore: number = selectedPage?.score ?? 87;
  const pageDepth: number = selectedPage?.depth ?? 0;

  const copyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(page, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {selectedPage && (
                <button
                  onClick={onBackToList}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 border border-white/[0.08]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Pages</span>
                </button>
              )}
              <span className="text-xs font-mono font-bold text-[#FF8A3D] bg-[#FF5E00]/10 px-2 py-0.5 rounded border border-[#FF5E00]/20">
                /pages/{selectedPage?.id || 'root'}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {page.status} {page.statusText}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white break-all">
              {page.url}
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-white/[0.08] shrink-0">
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Page SEO Score</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black font-mono text-white">{pageScore}</span>
                <span className="text-xs font-mono text-neutral-500">/ 100</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/[0.08]" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Crawl Depth</div>
              <div className="text-sm font-bold font-mono text-white mt-1">{pageDepth} clicks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#141414] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-white/[0.06] text-xs">
            {(['meta', 'headings', 'content', 'links', 'images', 'schema', 'performance', 'raw'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  activeTab === tab ? 'bg-[#1C1C1C] text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab === 'raw' ? 'Raw Extracted JSON' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'raw' && (
            <button
              onClick={copyRaw}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-white/[0.06]"
            >
              {copiedRaw ? (
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

        {/* Tab Content */}
        <div className="p-6 text-xs text-neutral-300">
          {activeTab === 'meta' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Document Metadata</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-500 font-mono">Title: </span>
                    <div className="font-semibold text-white mt-0.5">{page.title || '(none)'}</div>
                    <span className="text-[10px] text-neutral-500">{page.title?.length || 0} characters</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-mono">Meta Description: </span>
                    <div className="text-neutral-200 mt-0.5">{page.metaDescription || '(none)'}</div>
                    <span className="text-[10px] text-neutral-500">{page.metaDescription?.length || 0} characters</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-mono">Canonical Link: </span>
                    <div className="font-mono text-[#FF8A3D] mt-0.5">{page.canonical || '(none)'}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-mono">Robots Directives: </span>
                    <div className="font-mono text-emerald-400 mt-0.5">{page.robotsMeta || 'index, follow'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'headings' && (
            <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Heading Architecture</div>
              <div className="space-y-2">
                {page.headings.h1.map((h: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-neutral-900 border border-white/[0.04]">
                    <span className="font-mono font-bold text-[#FF5E00]">H1: </span>
                    <span className="font-semibold text-white">{h}</span>
                  </div>
                ))}
                {page.headings.h2.map((h: string, i: number) => (
                  <div key={i} className="p-2 rounded-xl bg-[#080808] ml-4 border border-white/[0.04]">
                    <span className="font-mono font-bold text-neutral-400">H2: </span>
                    <span>{h}</span>
                  </div>
                ))}
                {page.headings.h3.map((h: string, i: number) => (
                  <div key={i} className="p-2 rounded-xl bg-[#080808] ml-8 border border-white/[0.04]">
                    <span className="font-mono font-bold text-neutral-500">H3: </span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="text-neutral-400 text-xs font-semibold">Word Count</div>
                <div className="text-3xl font-black font-mono text-white mt-1">{page.wordCount.toLocaleString()}</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {page.wordCount > 300 ? '✓ Satisfies quality threshold' : '✕ Potential thin content'}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="text-neutral-400 text-xs font-semibold">Est. Reading Time</div>
                <div className="text-3xl font-black font-mono text-white mt-1">{page.readingTimeMin} min</div>
                <div className="text-[11px] text-neutral-400 mt-1">Based on 200 words / min</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="text-neutral-400 text-xs font-semibold">Content-Type</div>
                <div className="text-sm font-mono text-[#FF8A3D] mt-2">{page.contentType}</div>
                <div className="text-[11px] text-neutral-400 mt-1">Charset: {page.charset}</div>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Internal Links Discovered ({page.links.totalInternal})
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                  {page.links.internal.map((link: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#080808] flex items-center justify-between">
                      <span className="text-white truncate max-w-md">{link.href}</span>
                      <span className="text-neutral-400 text-[10px]">Anchor: "{link.anchor}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  External Outbound Links ({page.links.totalExternal})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                  {page.links.external.map((link: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#080808] flex items-center justify-between">
                      <span className="text-neutral-300 truncate max-w-md">{link.href}</span>
                      <span className="text-[#FF8A3D] text-[10px]">
                        {link.nofollow ? 'nofollow' : 'dofollow'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Extracted Images ({page.images.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {page.images.map((img: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-1.5">
                    <div className="font-mono text-white truncate text-[11px]">{img.src}</div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded ${img.hasAlt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {img.hasAlt ? `alt: "${img.alt}"` : 'missing alt'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${img.hasDimensions ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {img.hasDimensions ? `${img.width}x${img.height}` : 'no dimensions'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Structured Schema JSON-LD ({page.jsonLd.length})
              </div>
              {page.jsonLd.map((s: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400">
                    <span>Types: [{s.types.join(', ')}]</span>
                    <span>{s.isValid ? '✓ Syntax Valid' : '✕ Syntax Error'}</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#080808] font-mono text-[11px] text-neutral-300 overflow-x-auto">
                    {JSON.stringify(s.parsed, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                  <div className="text-neutral-400 text-xs font-semibold">TTFB Latency</div>
                  <div className="text-3xl font-black font-mono text-[#FF8A3D] mt-1">{page.responseTimeMs}ms</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Live HTTP handshake probe</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                  <div className="text-neutral-400 text-xs font-semibold">Content Size</div>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {Math.round(page.performance.contentLengthBytes / 1024)} KB
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">HTML document payload</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.06]">
                  <div className="text-neutral-400 text-xs font-semibold">Protocol Security</div>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                    {page.isHttps ? 'HTTPS' : 'HTTP'}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">TLS encrypted session</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <pre className="p-4 rounded-2xl bg-[#080808] border border-white/[0.06] font-mono text-xs text-neutral-300 overflow-x-auto max-h-[500px]">
              {JSON.stringify(page, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
