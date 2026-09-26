import React, { useState } from 'react';
import {
  Cpu,
  FileSearch,
  Zap,
  Code2,
  GitBranch,
  Link2,
  TrendingUp,
  Globe2,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { DEMO_FEATURE_CARDS } from '../data/seoData';
import { FeatureDetail } from '../types/seo';

export const InteractiveCardsSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('tech-audit');

  const iconMap: Record<string, React.ElementType> = {
    'tech-audit': Cpu,
    'on-page': FileSearch,
    'pagespeed': Zap,
    'schema': Code2,
    'internal-links': GitBranch,
    'backlinks': Link2,
    'keywords': TrendingUp,
    'domain-intel': Globe2,
  };

  const selectedFeature =
    DEMO_FEATURE_CARDS.find((f) => f.id === selectedId) || DEMO_FEATURE_CARDS[0];

  return (
    <section id="signals" className="py-24 border-t border-white/[0.05] bg-[#0A0A0A]/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
              Comprehensive Checkpoints
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Modular Diagnostic Engines
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              Select an engine to inspect signal depth, audit mechanics, and real-time telemetry checkpoints.
            </p>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            ENGINE STATUS: <span className="text-emerald-400 font-semibold">ALL NOMINAL</span>
          </div>
        </div>

        {/* Horizontal scrollable / grid cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {DEMO_FEATURE_CARDS.map((card) => {
            const Icon = iconMap[card.id] || Cpu;
            const isSelected = card.id === selectedId;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedId(card.id)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 group ${
                  isSelected
                    ? 'bg-[#181818] border-[#FF5E00] shadow-xl shadow-[#FF5E00]/15 -translate-y-1'
                    : 'bg-[#101010]/80 border-white/[0.06] hover:bg-[#141414] hover:border-white/[0.15] hover:-translate-y-0.5'
                } border`}
              >
                {/* Active indicator dot */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF5E00] shadow-[0_0_8px_#FF5E00]" />
                )}

                <div>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#FF5E00] text-white shadow-md shadow-[#FF5E00]/30'
                        : 'bg-neutral-900 text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white mt-3 line-clamp-1">
                    {card.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-tight">
                    {card.tagline}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.05]">
                  <div className="text-[10px] uppercase font-mono text-neutral-400">Signals</div>
                  <div className="text-xs font-mono font-bold text-[#FF8A3D] tabular-nums">
                    {card.signalsCount} checks
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Engine Inspection Drilldown Card */}
        <div className="mt-8 rounded-3xl bg-[#121212] border border-white/[0.1] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5E00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left overview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-[#FF8A3D] bg-[#FF5E00]/10 px-2.5 py-1 rounded-md border border-[#FF5E00]/20">
                  {selectedFeature.badge}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {selectedFeature.signalsCount} Verified Inspection Rules
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedFeature.name} Engine
              </h3>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
                {selectedFeature.description}
              </p>

              {/* Verified Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {selectedFeature.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2 text-xs text-neutral-300 bg-[#161616] p-2.5 rounded-xl border border-white/[0.04]"
                  >
                    <CheckCircle className="w-4 h-4 text-[#FF5E00] shrink-0" />
                    <span className="font-medium">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Telemetry card */}
            <div className="lg:col-span-5 bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                  Engine Benchmark
                </span>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.08]">
                  DEMO METRIC
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-neutral-400">{selectedFeature.metricLabel}</div>
                  <div className="text-4xl font-black font-mono text-white mt-1 tabular-nums">
                    {selectedFeature.keyMetric}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-400">Frequency</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-1">Real-Time</div>
                </div>
              </div>

              <div className="text-xs text-neutral-400 bg-neutral-900/60 p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                Autonomous crawlers run continuously across background threads, dispatching alerts immediately upon metric deviation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
