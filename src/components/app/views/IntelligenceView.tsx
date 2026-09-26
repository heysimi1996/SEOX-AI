import React, { useState } from 'react';
import {
  Brain,
  GitBranch,
  Copy,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { InternalLinkGraph } from '../InternalLinkGraph';

export const IntelligenceView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'graph' | 'duplicates' | 'cannibalization' | 'semantic'>('graph');

  const duplicateDetections = [
    {
      id: 'DUP-1',
      title: 'Category Pagination Filter Clusters',
      similarity: '89%',
      urlA: 'https://example.com/products?sort=popular&page=2',
      urlB: 'https://example.com/products?page=2',
      tag: 'Potential Duplicate',
      reason: 'Normalized DOM text and heading hash matches 89% identical structure.',
      action: 'Implement canonical tag pointing to primary non-parameterized category path.',
    },
    {
      id: 'DUP-2',
      title: 'Trailing Slash Variation Loop',
      similarity: '100%',
      urlA: 'https://example.com/pricing',
      urlB: 'https://example.com/pricing/',
      tag: 'Potential Duplicate',
      reason: 'Exact 100% hash collision between trailing-slash and non-trailing-slash permalinks.',
      action: 'Enforce strict 301 server redirect to unified trailing-slash standard.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Semantic SEO & Algorithmic Topology
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Intelligence, Duplicates & Link Equity
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Detect internal link equity bottlenecks, orphan pages, content similarity hashing,
            and keyword cannibalization across all crawling tiers.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.06] text-xs">
          {[
            { id: 'graph', label: 'Internal Link Graph' },
            { id: 'duplicates', label: 'Duplicate Content Hashing' },
            { id: 'cannibalization', label: 'Keyword Cannibalization' },
            { id: 'semantic', label: 'Semantic Entity Graph' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#FF5E00] text-white font-bold shadow-md shadow-[#FF5E00]/25'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtab 1: Site Graph */}
      {activeSubTab === 'graph' && <InternalLinkGraph />}

      {/* Subtab 2: Duplicates */}
      {activeSubTab === 'duplicates' && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Content Similarity & Hash Inspection</h3>
              <p className="text-xs text-neutral-400">
                Uses text normalization and shingle hashing. Identified items are marked as "Potential Duplicate".
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1 rounded-xl border border-white/[0.06]">
              {duplicateDetections.length} Potential Clusters
            </span>
          </div>

          <div className="space-y-3">
            {duplicateDetections.map((dup) => (
              <div
                key={dup.id}
                className="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-400">{dup.id}</span>
                    <span className="font-bold text-white text-sm">{dup.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                      {dup.tag}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#FF8A3D]">{dup.similarity} Similarity</span>
                </div>

                <div className="space-y-1 font-mono text-[11px] bg-[#0A0A0A] p-3 rounded-xl border border-white/[0.04]">
                  <div className="text-neutral-300 truncate">URL A: {dup.urlA}</div>
                  <div className="text-neutral-400 truncate">URL B: {dup.urlB}</div>
                </div>

                <div className="text-neutral-300">
                  <strong className="text-neutral-400">Analysis: </strong>
                  <span>{dup.reason}</span>
                </div>

                <div className="text-neutral-300">
                  <strong className="text-[#FF8A3D]">Resolution: </strong>
                  <span>{dup.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Cannibalization */}
      {activeSubTab === 'cannibalization' && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Keyword Cannibalization Radar</h3>
          <p className="text-xs text-neutral-400">
            Detects multiple URLs competing for identical primary search intents and query clusters.
          </p>

          <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] text-xs space-y-2">
            <div className="font-bold text-white">Target Query: "seo audit tools"</div>
            <div className="text-neutral-400">2 internal URLs discovered targeting overlapping H1 intent.</div>
            <div className="text-xs text-emerald-400 font-semibold pt-1">
              ✓ Resolved by canonical consolidation to primary hub
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Semantic Graph */}
      {activeSubTab === 'semantic' && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">AI Search & Entity Graph Citations</h3>
          <p className="text-xs text-neutral-400">
            Evaluates schema bindings and author trust signals for Generative Search (AEO / GEO).
          </p>
          <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.06] text-xs space-y-2">
            <div className="font-bold text-white">Entity Citation Strength: 92%</div>
            <div className="text-neutral-400">
              Valid Organization and WebPage graphs linked to recognized Knowledge Graph Wikidata authorities.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
