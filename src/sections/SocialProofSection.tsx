import React from 'react';
import { Users, Layers, Code2, Globe } from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const audiences = [
    {
      label: 'SEO Teams',
      description: 'Enterprise rank monitoring & content gaps',
      icon: Users,
    },
    {
      label: 'Agencies',
      description: 'White-label audits & automated client reports',
      icon: Layers,
    },
    {
      label: 'Developers',
      description: 'CI/CD performance budgets & schema validation',
      icon: Code2,
    },
    {
      label: 'Website Owners',
      description: 'Actionable executive roadmaps without jargon',
      icon: Globe,
    },
  ];

  return (
    <section className="py-14 border-y border-white/[0.05] bg-[#0A0A0A]/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-8">
          Built for SEO teams, agencies and website owners.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <div
                key={aud.label}
                className="group p-4 sm:p-5 rounded-2xl bg-[#111111]/60 hover:bg-[#161616] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/[0.08] flex items-center justify-center text-neutral-300 group-hover:text-[#FF5E00] group-hover:border-[#FF5E00]/30 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 font-bold text-sm text-white group-hover:text-white">
                  {aud.label}
                </div>
                <div className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {aud.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
