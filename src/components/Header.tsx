import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onOpenAudit: (domain?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAudit, onOpenAuth, onOpenApp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('navigation.seoAudit'), href: '#features' },
    { label: t('navigation.technicalSeo'), href: '#audit-preview' },
    { label: 'SEO Tools', href: '/seo-tools/' },
    { label: 'Entity Manager', href: '/entity-manager' },
    { label: t('navigation.backlinks'), href: '#signals' },
    { label: t('navigation.keywords'), href: '#signals' },
    { label: t('navigation.domain'), href: '#dashboard' },
    { label: 'Check Redirect 301', href: '/redirect-check' },
    { label: t('navigation.aiCopilot'), href: '#copilot' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3.5 bg-[#080808]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/80'
          : 'py-6 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="flex items-center gap-2 group tracking-tight text-white font-extrabold text-xl sm:text-2xl transition-opacity hover:opacity-90"
            aria-label="SEOX AI Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5E00] to-[#E63900] flex items-center justify-center shadow-lg shadow-[#FF5E00]/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-tighter">S</span>
            </div>
            <span>
              SEOX<span className="text-[#FF5E00] ml-1">AI</span>
            </span>
          </a>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-neutral-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-200 relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#FF5E00] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary actions & Language Switcher */}
          <div className="hidden sm:flex items-center gap-2.5">
            <LanguageSwitcher />

            {onOpenApp && (
              <button
                onClick={onOpenApp}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] transition-colors cursor-pointer"
              >
                {t('navigation.overview')}
              </button>
            )}
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {t('navigation.signIn')}
            </button>
            <button
              onClick={() => onOpenAudit()}
              className="relative group px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF5E00] hover:bg-[#FF6D1A] transition-all duration-200 shadow-md shadow-[#FF5E00]/25 hover:shadow-lg hover:shadow-[#FF5E00]/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>{t('navigation.startAudit')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Mobile hamburger button & Compact Language Switcher */}
          <div className="xl:hidden flex items-center gap-2">
            <LanguageSwitcher isMobileCompact />
            <button
              onClick={() => onOpenAudit()}
              className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#FF5E00] flex items-center gap-1"
            >
              {t('common.score')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E00]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0D0D0D] border-b border-white/[0.08] px-5 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-neutral-300 hover:text-[#FF5E00] transition-colors py-2.5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('signin');
              }}
              className="w-full py-2.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900 border border-white/[0.08]"
            >
              {t('navigation.signIn')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAudit();
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-[#FF5E00] shadow-md shadow-[#FF5E00]/25 flex items-center justify-center gap-1.5"
            >
              <span>{t('navigation.startAudit')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
