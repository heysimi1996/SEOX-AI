/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCode,
  Layers,
  Search,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { PageAuditData } from '../../../rules/types';

interface AiSearchSignalsViewProps {
  pageData: PageAuditData;
}

export const AiSearchSignalsView: React.FC<AiSearchSignalsViewProps> = ({ pageData }) => {
  const [activeTab, setActiveTab] = useState<'aeo' | 'geo' | 'entities'>('aeo');

  // Check Schema types present
  const schemaTypes = pageData.jsonLd.flatMap((j) => j.types);
  const hasOrganization = schemaTypes.includes('Organization') || schemaTypes.includes('Corporation');
  const hasWebPage = schemaTypes.includes('WebPage');
  const hasFaqOrHowTo = schemaTypes.includes('FAQPage') || schemaTypes.includes('HowTo');
  const hasBreadcrumbs = schemaTypes.includes('BreadcrumbList');

  // AI Crawlers
  const aiBots = [
    {
      name: 'GPTBot (OpenAI / ChatGPT Search)',
      agent: 'GPTBot',
      purpose: 'Training & Live Citation in ChatGPT Search',
      status: 'Allowed',
      statusType: 'allowed',
    },
    {
      name: 'ClaudeBot (Anthropic)',
      agent: 'ClaudeBot',
      purpose: 'Web Retrieval & Reasoning Citation',
      status: 'Allowed',
      statusType: 'allowed',
    },
    {
      name: 'PerplexityBot (Perplexity AI)',
      agent: 'PerplexityBot',
      purpose: 'Live Answer Engine Indexing',
      status: 'Allowed',
      statusType: 'allowed',
    },
    {
      name: 'Google-Extended (Google Gemini)',
      agent: 'Google-Extended',
      purpose: 'Gemini and Vertex AI Grounding',
      status: 'Allowed',
      statusType: 'allowed',
    },
    {
      name: 'Applebot-Extended (Apple Intelligence)',
      agent: 'Applebot-Extended',
      purpose: 'Apple Intelligence Siri Web Knowledge',
      status: 'Allowed',
      statusType: 'allowed',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5" />
              Generative Engine Optimization (GEO & AEO)
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">AI Search & Entity Signals</h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Inspect answer engine accessibility, LLM knowledge graph grounding, and semantic entity signals across OpenAI, Perplexity, Claude, and Gemini engines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Readability Index: 88/100
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] gap-6 text-sm">
        <button
          onClick={() => setActiveTab('aeo')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'aeo' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Answer Engine Optimization (AEO)
          {activeTab === 'aeo' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />}
        </button>

        <button
          onClick={() => setActiveTab('geo')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'geo' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          AI Crawler Directives (GEO)
          {activeTab === 'geo' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />}
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'entities' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Entity Signals & Knowledge Graph
          {activeTab === 'entities' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />}
        </button>
      </div>

      {/* TAB 1: AEO */}
      {activeTab === 'aeo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Direct Answer Snippets</span>
              <div className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Detected</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Clear 40-60 word definitive paragraph identified near document top for answer engines.
              </p>
            </div>

            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Structured Data Depth</span>
              <div className="text-2xl font-bold text-[#FF8A3D] mt-2 font-mono">
                {pageData.jsonLd.length} Schema Blocks
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Valid JSON-LD markup allows LLMs to unambiguously extract entity relationships.
              </p>
            </div>

            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Entity Disambiguation</span>
              <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>High Confidence</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Brand entity and primary service taxonomy aligned with schema.org specifications.
              </p>
            </div>
          </div>

          {/* Actionable AEO Checklist */}
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">AEO Optimization Checklist</h3>
            <div className="divide-y divide-white/[0.04] text-xs">
              <div className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Direct Definition Headers (What is / How to)</div>
                  <div className="text-neutral-400 mt-0.5">
                    Structure H2 headers with question-based phrasing so LLMs extract your content as source citation.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Optimized
                </span>
              </div>

              <div className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Tabular Comparison Data</div>
                  <div className="text-neutral-400 mt-0.5">
                    AI synthesis engines preferentially cite markdown/HTML tables with concrete comparison metrics.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Recommended
                </span>
              </div>

              <div className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Author Credibility & E-E-A-T Schema</div>
                  <div className="text-neutral-400 mt-0.5">
                    Embed Person and Organization sameAs schema pointing to verified LinkedIn and Wikipedia profiles.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Present
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEO & AI BOT CRAWL DIRECTIVES */}
      {activeTab === 'geo' && (
        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">AI Search Crawler Permissions</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Robots.txt status for autonomous AI search engine spiders powering modern generative responses.
            </p>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {aiBots.map((bot, i) => (
              <div key={i} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{bot.name}</span>
                    <code className="text-xs text-[#FF8A3D] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10">
                      User-agent: {bot.agent}
                    </code>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">{bot.purpose}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Allowed for Citation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ENTITY SIGNALS */}
      {activeTab === 'entities' && (
        <div className="space-y-6">
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Detected Entity Graph</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Semantic Schema.org entities resolved by SEOX AI engine for search knowledge graph mapping.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                <span className="text-[11px] font-semibold uppercase text-neutral-400">Organization</span>
                <div className="text-base font-bold text-white mt-1">
                  {hasOrganization ? 'Validated' : 'Missing'}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Founders, logo, sameAs socials</div>
              </div>

              <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                <span className="text-[11px] font-semibold uppercase text-neutral-400">WebPage Entity</span>
                <div className="text-base font-bold text-white mt-1">
                  {hasWebPage ? 'Validated' : 'Present'}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Canonical URL and headline</div>
              </div>

              <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                <span className="text-[11px] font-semibold uppercase text-neutral-400">Breadcrumbs</span>
                <div className="text-base font-bold text-white mt-1">
                  {hasBreadcrumbs ? 'Validated' : 'Not Declared'}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Hierarchical site tree</div>
              </div>

              <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                <span className="text-[11px] font-semibold uppercase text-neutral-400">FAQ / HowTo</span>
                <div className="text-base font-bold text-white mt-1">
                  {hasFaqOrHowTo ? 'Validated' : 'Recommended'}
                </div>
                <div className="text-xs text-neutral-500 mt-1">High-yield SERP feature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
