import React from 'react';
import { useI18n } from '../i18n';

export const Footer: React.FC = () => {
  const { t, locale } = useI18n();

  const productLinks = [
    { label: t('navigation.seoAudit'), href: '#audit-preview' },
    { label: t('navigation.technicalSeo'), href: '#features' },
    { label: t('navigation.backlinks'), href: '#signals' },
    { label: t('navigation.keywordTracking'), href: '#signals' },
    { label: t('navigation.domain'), href: '#dashboard' },
    { label: t('navigation.aiCopilot'), href: '#copilot' },
  ];

  const resourceLinks = [
    { label: locale === 'vi' ? 'Cẩm nang SEO' : 'SEO Guide', href: '#' },
    { label: locale === 'vi' ? 'Tài liệu hướng dẫn' : 'Documentation', href: '#' },
    { label: locale === 'vi' ? 'Tài liệu API' : 'API Reference', href: '#' },
    { label: locale === 'vi' ? 'Nhật ký cập nhật' : 'Changelog', href: '#' },
  ];

  const companyLinks = [
    { label: locale === 'vi' ? 'Giới thiệu' : 'About', href: '#' },
    { label: locale === 'vi' ? 'Liên hệ' : 'Contact', href: '#' },
    { label: locale === 'vi' ? 'Chính sách bảo mật' : 'Privacy', href: '#' },
    { label: locale === 'vi' ? 'Điều khoản sử dụng' : 'Terms', href: '#' },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#080808] pt-16 pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href="/"
              className="flex items-center gap-2 group tracking-tight text-white font-extrabold text-xl"
              aria-label="SEOX AI Home"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF5E00] to-[#E63900] flex items-center justify-center shadow-md shadow-[#FF5E00]/25">
                <span className="text-white font-black text-xs tracking-tighter">S</span>
              </div>
              <span>
                SEOX<span className="text-[#FF5E00] ml-1">AI</span>
              </span>
            </a>

            <p className="text-neutral-400 text-xs max-w-sm leading-relaxed">
              {locale === 'vi'
                ? 'Nền tảng phân tích SEO chuyên sâu, kiểm toán kỹ thuật toàn diện và đo kiểm hạ tầng tên miền bằng trí tuệ nhân tạo.'
                : 'AI-powered SEO intelligence, deep technical crawler auditing, and domain telemetry for high-growth engineering and marketing teams.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-white/[0.06] text-[11px] font-mono text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {locale === 'vi' ? 'Toàn bộ máy chủ quét hoạt động bình thường' : 'All Global Scanners Operational'}
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-white text-[11px]">
              {locale === 'vi' ? 'Sản phẩm' : 'Product'}
            </div>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-white text-[11px]">
              {locale === 'vi' ? 'Tài nguyên' : 'Resources'}
            </div>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-white text-[11px]">
              {locale === 'vi' ? 'Về chúng tôi' : 'Company'}
            </div>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
          <div>
            © {new Date().getFullYear()} SEOX AI Platform Inc. {locale === 'vi' ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Twitter / X
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-white transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
