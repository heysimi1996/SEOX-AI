import React from 'react';
import { DataWaveCanvas } from '../components/DataWaveCanvas';
import { Activity, Network, Zap } from 'lucide-react';

export const WaveVisualSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-[#080808] overflow-hidden border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />
            <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
              Autonomous Mesh Stream
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Continuous Algorithmic Telemetry
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time packet propagation tracing internal link equity, core web vitals latency,
            and SERP fluctuation waves across your domain graph.
          </p>
        </div>

        {/* Wave visual canvas container */}
        <div className="relative rounded-3xl bg-[#0D0D0D] border border-white/[0.08] shadow-2xl overflow-hidden">
          <DataWaveCanvas />

          {/* Floating Telemetry Indicators over wave */}
          <div className="absolute bottom-5 inset-x-5 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Link Equity: 99.8% Transferred</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#FF5E00]" />
              <span>DOM Spider: 48 URLs / sec</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Edge TLS: 18ms latency</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
