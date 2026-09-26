import React from 'react';
import { URLAnalyzerInput } from '../components/URLAnalyzerInput';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuditCtaSectionProps {
  onAnalyze: (url: string) => void;
}

export const AuditCtaSection: React.FC<AuditCtaSectionProps> = ({ onAnalyze }) => {
  const pillars = [
    'Technical SEO',
    'Content',
    'Performance',
    'Indexability',
    'Schema',
    'AI Insights',
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0A]">
      {/* Intense glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF5E00]/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-[#141414] to-[#0D0D0D] border border-white/[0.12] p-8 sm:p-14 text-center shadow-2xl shadow-black relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5E00] to-transparent" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/[0.08] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
              Immediate Free Audit
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Your Website.{' '}
            <span className="bg-gradient-to-r from-[#FF5E00] via-[#FF7A1A] to-[#FFA726] bg-clip-text text-transparent">
              Understood in Minutes.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-normal">
            Enter your domain for an immediate technical crawl, Core Web Vitals benchmark,
            and AI Copilot action plan. No setup required.
          </p>

          {/* URL Input */}
          <div className="mt-8 max-w-xl mx-auto">
            <URLAnalyzerInput
              onAnalyze={onAnalyze}
              placeholder="https://example.com"
              buttonLabel="RUN SEO AUDIT"
            />
          </div>

          {/* Supporting pillars unboxed clean metadata */}
          <div className="mt-8 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-400">
            {pillars.map((pillar, idx) => (
              <React.Fragment key={pillar}>
                <span className="hover:text-white transition-colors">{pillar}</span>
                {idx < pillars.length - 1 && (
                  <span aria-hidden="true" className="text-neutral-700">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
