/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useI18n, SupportedLocale } from '../i18n';

interface LanguageSwitcherProps {
  className?: string;
  isMobileCompact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  isMobileCompact = false,
}) => {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: SupportedLocale) => {
    setLocale(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={locale === 'vi' ? 'Chọn ngôn ngữ' : 'Select language'}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer select-none"
      >
        <span className="text-sm leading-none" role="img" aria-label={locale === 'vi' ? 'Việt Nam' : 'English'}>
          {locale === 'vi' ? '🇻🇳' : '🇺🇸'}
        </span>
        <span className="font-mono">{locale.toUpperCase()}</span>
        {!isMobileCompact && <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#121212] border border-white/10 shadow-2xl py-1 z-50 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleSelect('vi')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
              locale === 'vi' ? 'bg-[#FF5E00]/15 text-[#FF8A3D] font-bold' : 'text-neutral-300 hover:bg-white/[0.04]'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">🇻🇳</span>
              <span>Tiếng Việt</span>
            </span>
            {locale === 'vi' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
              locale === 'en' ? 'bg-[#FF5E00]/15 text-[#FF8A3D] font-bold' : 'text-neutral-300 hover:bg-white/[0.04]'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">🇺🇸</span>
              <span>English</span>
            </span>
            {locale === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00]" />}
          </button>
        </div>
      )}
    </div>
  );
};
