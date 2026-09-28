import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { URLAnalyzerInput } from '../components/URLAnalyzerInput';
import { Seo3dSphere } from '../components/Seo3dSphere';
import { LiveScanPreview } from '../components/LiveScanPreview';
import { useI18n } from '../i18n';

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyze,
  onExplore,
}) => {
  const { t, locale } = useI18n();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FF5E00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#FF3D00]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Small label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
                {locale === 'vi' ? 'Trí Tuệ Nhân Tạo SEO Chuyên Sâu' : 'AI-Powered SEO Intelligence'}
              </span>
            </div>

            <div className="mx-auto lg:mx-0 max-w-[760px] overflow-hidden rounded-[28px] border border-[#FF7A1A]/40 bg-[#0d0d0d]/70 p-2 shadow-[0_0_30px_rgba(255,125,34,0.2)] backdrop-blur-sm">
              <img
                src="/logo-seox-ai.png"
                alt="SEOX AI"
                className="h-auto w-full max-w-full object-contain drop-shadow-[0_0_18px_rgba(255,126,2,0.35)]"
              />
            </div>

            {/* Large headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              {locale === 'vi' ? (
                <>
                  PHÂN TÍCH SEO.
                  <br />
                  <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    HIỂU WEBSITE.
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#FF5E00] via-[#FF7A1A] to-[#FFA726] bg-clip-text text-transparent">
                    SỬA ĐÚNG VẤN ĐỀ.
                  </span>
                </>
              ) : (
                <>
                  ANALYZE SEO.
                  <br />
                  <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    UNDERSTAND YOUR WEBSITE.
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#FF5E00] via-[#FF7A1A] to-[#FFA726] bg-clip-text text-transparent">
                    FIX WHAT MATTERS.
                  </span>
                </>
              )}
            </h1>

            {/* Supporting line */}
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed text-pretty">
              {t('audit.heroSubtitle')}
            </p>

            {/* Hero URL input */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <URLAnalyzerInput
                onAnalyze={onAnalyze}
                placeholder={t('audit.urlInputPlaceholder')}
                buttonLabel={t('audit.analyzeWebsite')}
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onAnalyze('https://yourwebsite.com')}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FF5E00] hover:bg-[#FF6D1A] transition-all duration-200 shadow-lg shadow-[#FF5E00]/30 hover:shadow-[#FF5E00]/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
              >
                <span>{t('audit.analyzeWebsite')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl font-semibold text-xs tracking-wider text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <span>{t('audit.explorePlatform')}</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Trust check markers */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'vi' ? 'Hơn 180+ điểm kiểm tra SEO' : '180+ Crawl Checkpoints'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'vi' ? 'Không cần thẻ tín dụng' : 'No Credit Card Required'}
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locale === 'vi' ? 'Báo cáo ngay tức thì' : 'Instant Report'}
              </span>
            </div>
          </div>

          {/* Right Column: Abstract 3D Visual + Floating Analytics Card */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* 3D abstract glowing sphere / SEO node */}
            <div className="w-full relative z-10">
              <Seo3dSphere />
            </div>

            {/* Overlapping floating live scan analytics card */}
            <div className="w-full -mt-10 sm:-mt-16 relative z-20">
              <LiveScanPreview onInspectMore={onExplore} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
