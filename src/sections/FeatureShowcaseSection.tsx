import React from 'react';
import { Cpu, FileText, Network, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface FeatureShowcaseSectionProps {
  onSelectFeature?: (featureId: string) => void;
}

export const FeatureShowcaseSection: React.FC<FeatureShowcaseSectionProps> = ({
  onSelectFeature,
}) => {
  const cards = [
    {
      id: 'tech-audit',
      title: 'Technical SEO',
      category: 'Core Engine',
      description:
        'Continuous deep crawl inspecting DOM status codes, crawl budget traps, canonical loopbacks, render blocking assets, and Core Web Vitals across millions of URLs.',
      icon: Cpu,
      stats: [
        { value: '1,284', label: 'Pages Analyzed' },
        { value: '42', label: 'Issues Found', highlight: true },
      ],
      tags: ['Crawl Depth Analysis', 'Canonical Verification', 'Robots & Sitemap'],
    },
    {
      id: 'content',
      title: 'Content Intelligence',
      category: 'Semantic Graph',
      description:
        'AI entity recognition maps topical authority against top SERP competitors, flags content decay, and isolates high-intent semantic gaps before competitors rank.',
      icon: FileText,
      stats: [
        { value: '87%', label: 'Topic Coverage' },
        { value: '12', label: 'Content Opportunities', highlight: true },
      ],
      tags: ['Entity Linkage', 'Keyword Cannibalization', 'Search Intent Fit'],
    },
    {
      id: 'domain-intel',
      title: 'Domain & Backlink Intelligence',
      category: 'Authority Radar',
      description:
        'Uncover toxic backlink surges, disavow hazardous anchor manipulations, and benchmark referring domain velocity against leading competitors in real time.',
      icon: Network,
      stats: [
        { value: '1.8K', label: 'Referring Domains' },
        { value: '94', label: 'Domain Signals', highlight: true },
      ],
      tags: ['Toxicity Monitoring', 'Link Equity Flow', 'Historical Velocity'],
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background soft ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF5E00]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />
            <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
              Full Spectrum Audit
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Every SEO Signal.{' '}
            <span className="bg-gradient-to-r from-[#FF5E00] via-[#FF7A1A] to-[#FFA726] bg-clip-text text-transparent">
              One Intelligence Layer.
            </span>
          </h2>

          <p className="text-base text-neutral-400 font-normal">
            Eliminate fragmented tools. SEOX AI unifies technical crawling, on-page semantics,
            performance budgets, and domain authority into a single real-time telemetry grid.
          </p>
        </div>

        {/* 3 Large Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="relative rounded-3xl bg-[#0F0F0F] border border-white/[0.08] hover:border-[#FF5E00]/40 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF5E00]/10 hover:-translate-y-1 group"
              >
                {/* Top card accent line */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E00]/25 to-transparent" />

                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/[0.08] flex items-center justify-center text-white group-hover:text-[#FF5E00] group-hover:border-[#FF5E00]/30 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[10px] font-mono font-medium text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-white/[0.06]">
                      DEMO
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Feature check tags */}
                  <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-2">
                    {card.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-2 text-xs text-neutral-400">
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF5E00]" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Metrics Section */}
                <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-2 gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-white/[0.04]">
                  {card.stats.map((stat) => (
                    <div key={stat.label}>
                      <div
                        className={`text-2xl font-extrabold font-mono tabular-nums ${
                          stat.highlight ? 'text-[#FF8A3D]' : 'text-white'
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
