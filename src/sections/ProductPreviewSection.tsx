import React from 'react';
import { DashboardPreview } from '../components/DashboardPreview';
import { Sparkles, Terminal } from 'lucide-react';

export const ProductPreviewSection: React.FC = () => {
  return (
    <section id="dashboard" className="py-24 relative overflow-hidden">
      {/* Background glow behind dashboard */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[#FF5E00]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />
            <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
              Production Dashboard Preview
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Live Intelligence at Scale.
          </h2>

          <p className="text-sm sm:text-base text-neutral-400">
            A single command center to visualize technical anomalies, monitor Core Web Vitals,
            track keyword shifts, and execute algorithmic remediations.
          </p>
        </div>

        {/* Dashboard Component */}
        <DashboardPreview />
      </div>
    </section>
  );
};
