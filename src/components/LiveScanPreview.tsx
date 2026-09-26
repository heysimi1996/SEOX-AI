import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Sparkles, RefreshCw } from 'lucide-react';
import { DEMO_HEALTH_SCORES } from '../data/seoData';

interface LiveScanPreviewProps {
  onInspectMore?: () => void;
}

export const LiveScanPreview: React.FC<LiveScanPreviewProps> = ({ onInspectMore }) => {
  const [animatedScores, setAnimatedScores] = useState(
    DEMO_HEALTH_SCORES.map((s) => ({ ...s, current: 0 }))
  );

  useEffect(() => {
    // Animate progress bars on load
    const timer = setTimeout(() => {
      setAnimatedScores(
        DEMO_HEALTH_SCORES.map((s) => ({ ...s, current: s.score }))
      );
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0 glass-card rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 border border-white/[0.09] overflow-hidden group">
      {/* Top subtle highlight shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E00]/40 to-transparent" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF5E00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E00] shadow-[0_0_8px_#FF5E00]" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-300">
            Website Health
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Explicit DEMO DATA label per requirements */}
          <span className="text-[11px] font-mono font-medium text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded border border-white/[0.08]">
            DEMO DATA
          </span>
        </div>
      </div>

      {/* Score Summary Block */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0A]/60 rounded-xl p-4 border border-white/[0.04]">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums">
            87
          </span>
          <span className="text-lg sm:text-xl font-medium text-neutral-500 font-mono">
            / 100
          </span>
          <span className="ml-3 text-xs font-medium text-emerald-400 flex items-center gap-0.5">
            Optimal State
          </span>
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <span>Target crawl:</span>
          <span className="text-white font-mono font-medium">1,284 URLs</span>
        </div>
      </div>

      {/* Signals Breakdown List */}
      <div className="mt-5 space-y-3.5">
        {animatedScores.map((item) => {
          const isWarning = item.score < 80;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-200">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 hidden sm:inline">
                    {item.trend}
                  </span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      isWarning ? 'text-[#FF8A3D]' : 'text-white'
                    }`}
                  >
                    {item.score}
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isWarning
                      ? 'bg-gradient-to-r from-[#FF7A1A] to-[#FF9E4A]'
                      : 'bg-gradient-to-r from-[#FF5E00] to-[#FF8A3D]'
                  }`}
                  style={{ width: `${item.current}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action */}
      {onInspectMore && (
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Real-time audit signals updated live
          </span>
          <button
            onClick={onInspectMore}
            className="text-xs font-semibold text-[#FF8A3D] hover:text-[#FFA766] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect All 184 Signals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
