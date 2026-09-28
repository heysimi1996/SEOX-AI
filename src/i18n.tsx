/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Vietnamese modules
import viCommon from './locales/vi/common.json';
import viNavigation from './locales/vi/navigation.json';
import viDashboard from './locales/vi/dashboard.json';
import viAudit from './locales/vi/audit.json';
import viIssues from './locales/vi/issues.json';
import viDomain from './locales/vi/domain.json';
import viBacklinks from './locales/vi/backlinks.json';
import viKeywords from './locales/vi/keywords.json';
import viContent from './locales/vi/content.json';
import viPerformance from './locales/vi/performance.json';
import viAi from './locales/vi/ai.json';
import viSettings from './locales/vi/settings.json';
import viReports from './locales/vi/reports.json';
import viAuth from './locales/vi/auth.json';
import viErrors from './locales/vi/errors.json';

// English modules
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enDashboard from './locales/en/dashboard.json';
import enAudit from './locales/en/audit.json';
import enIssues from './locales/en/issues.json';
import enDomain from './locales/en/domain.json';
import enBacklinks from './locales/en/backlinks.json';
import enKeywords from './locales/en/keywords.json';
import enContent from './locales/en/content.json';
import enPerformance from './locales/en/performance.json';
import enAi from './locales/en/ai.json';
import enSettings from './locales/en/settings.json';
import enReports from './locales/en/reports.json';
import enAuth from './locales/en/auth.json';
import enErrors from './locales/en/errors.json';
import { canonicalUrlForPath } from './data/canonicalUrl';

export type SupportedLocale = 'vi' | 'en';

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

const translations: Record<SupportedLocale, Record<string, Record<string, any>>> = {
  vi: {
    common: viCommon,
    navigation: viNavigation,
    dashboard: viDashboard,
    audit: viAudit,
    issues: viIssues,
    domain: viDomain,
    backlinks: viBacklinks,
    keywords: viKeywords,
    content: viContent,
    performance: viPerformance,
    ai: viAi,
    settings: viSettings,
    reports: viReports,
    auth: viAuth,
    errors: viErrors,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    dashboard: enDashboard,
    audit: enAudit,
    issues: enIssues,
    domain: enDomain,
    backlinks: enBacklinks,
    keywords: enKeywords,
    content: enContent,
    performance: enPerformance,
    ai: enAi,
    settings: enSettings,
    reports: enReports,
    auth: enAuth,
    errors: enErrors,
  },
};

/**
 * Locale detection priority:
 * 1. User manual preference saved in localStorage
 * 2. Cookie 'seox_locale'
 * 3. URL path (/en/ -> en, / -> vi)
 * 4. Browser language (vi-VN, vi -> vi, en -> en)
 * 5. Default = vi
 */
function detectDefaultLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'vi';

  // 1. Saved localStorage
  try {
    const saved = localStorage.getItem('seox_locale');
    if (saved === 'vi' || saved === 'en') {
      return saved;
    }
  } catch {}

  // 2. Cookie
  try {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)seox_locale=(vi|en)(?:;|$)/);
    if (cookieMatch && (cookieMatch[1] === 'vi' || cookieMatch[1] === 'en')) {
      return cookieMatch[1] as SupportedLocale;
    }
  } catch {}

  // 3. URL path check
  const path = window.location.pathname;
  if (path.startsWith('/en/') || path === '/en') {
    return 'en';
  }

  // 4. Browser language
  const navLang = navigator.language || (navigator as any).userLanguage || '';
  if (navLang.toLowerCase().startsWith('vi')) {
    return 'vi';
  }
  if (navLang.toLowerCase().startsWith('en')) {
    return 'en';
  }

  // 5. Default to Vietnamese
  return 'vi';
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => detectDefaultLocale());

  // Keep html tag and document title in sync with current locale
  useEffect(() => {
    document.documentElement.lang = locale;
    
    // Update canonical link element
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrlForPath(window.location.pathname));

    // Save to localStorage & cookie for persistence
    try {
      localStorage.setItem('seox_locale', locale);
      document.cookie = `seox_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('seox_locale', newLocale);
      document.cookie = `seox_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Sync URL without hard refresh
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      const isSeoToolsRoute = path === '/seo-tools' || path.startsWith('/seo-tools/');
      if (!isSeoToolsRoute && newLocale === 'en' && !path.startsWith('/en')) {
        const newPath = '/en' + (path === '/' ? '' : path);
        window.history.pushState({}, '', newPath + search + hash);
      } else if (!isSeoToolsRoute && newLocale === 'vi' && path.startsWith('/en')) {
        const newPath = path.replace(/^\/en(?:\/|$)/, '/') || '/';
        window.history.pushState({}, '', newPath + search + hash);
      }
    } catch {}
  };

  /**
   * Translate key with dotted path like "audit.analyzeWebsite" or "common.save"
   * Includes fallback to opposite language or key, with missing key warning
   */
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const parts = keyPath.split('.');
    if (parts.length < 2) {
      console.warn(`[i18n] Translation key should be in module.key format: "${keyPath}"`);
      return keyPath;
    }

    const [module, ...subKeys] = parts;
    const key = subKeys.join('.');

    // Try current locale
    let text = translations[locale]?.[module]?.[key];

    // Fallback to opposite locale (default 'vi' or 'en')
    if (text === undefined) {
      const fallbackLocale = locale === 'vi' ? 'en' : 'vi';
      text = translations[fallbackLocale]?.[module]?.[key];
      if (text !== undefined) {
        console.warn(`Missing translation key in "${locale}": ${keyPath}`);
      }
    }

    if (text === undefined) {
      console.warn(`Missing translation key: ${keyPath}`);
      return keyPath;
    }

    // Handle template interpolation like {{count}}, {{days}}, {{points}}
    if (params) {
      return Object.entries(params).reduce((acc, [pKey, pVal]) => {
        return acc.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'), String(pVal));
      }, String(text));
    }

    return String(text);
  };

  const formatNumber = (value: number): string => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(value);
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);

    if (locale === 'vi') {
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatNumber, formatDate }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
