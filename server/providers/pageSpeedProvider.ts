/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PageSpeedMetrics {
  lcp: number; // in seconds
  inp: number; // in ms
  cls: number; // unitless
  fcp: number; // in seconds
  ttfb: number; // in ms
  performanceScore: number; // 0-100
}

export interface PageSpeedAnalysisResponse {
  status: 'configured' | 'not_configured';
  configured: boolean;
  provider: string;
  url: string;
  strategy: 'mobile' | 'desktop';
  metrics?: PageSpeedMetrics;
  fieldData?: {
    lcpCategory: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
    clsCategory: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
    inpCategory: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
  };
  diagnostics?: Array<{ title: string; description: string; score: number | null }>;
  message?: string;
  analyzedAt: string;
}

export interface PageSpeedProvider {
  name: string;
  isConfigured: () => boolean;
  analyze: (url: string, strategy?: 'mobile' | 'desktop') => Promise<PageSpeedAnalysisResponse>;
}

export class GooglePageSpeedProvider implements PageSpeedProvider {
  name = 'Google PageSpeed Insights';

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_PAGESPEED_API_KEY && process.env.GOOGLE_PAGESPEED_API_KEY.trim().length > 0);
  }

  async analyze(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedAnalysisResponse> {
    const configured = this.isConfigured();

    if (!configured) {
      return {
        status: 'not_configured',
        configured: false,
        provider: this.name,
        url,
        strategy,
        message: 'Nguồn dữ liệu PageSpeed chưa được cấu hình. Kết nối GOOGLE_PAGESPEED_API_KEY để thu thập chỉ số Core Web Vitals thực tế.',
        analyzedAt: new Date().toISOString(),
      };
    }

    try {
      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
      const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;

      const res = await fetch(endpoint, {
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          status: 'not_configured',
          configured: true,
          provider: this.name,
          url,
          strategy,
          message: `PageSpeed API error: HTTP ${res.status}`,
          analyzedAt: new Date().toISOString(),
        };
      }

      const data = await res.json();
      const lighthouse = data?.lighthouseResult;
      const audits = lighthouse?.audits || {};
      const categories = lighthouse?.categories || {};

      const performanceScore = Math.round((categories?.performance?.score || 0) * 100);
      const lcpSec = audits['largest-contentful-paint']?.numericValue ? +(audits['largest-contentful-paint'].numericValue / 1000).toFixed(2) : 0;
      const inpMs = audits['interaction-to-next-paint']?.numericValue ? Math.round(audits['interaction-to-next-paint'].numericValue) : 0;
      const cls = audits['cumulative-layout-shift']?.numericValue ? +audits['cumulative-layout-shift'].numericValue.toFixed(3) : 0;
      const fcpSec = audits['first-contentful-paint']?.numericValue ? +(audits['first-contentful-paint'].numericValue / 1000).toFixed(2) : 0;
      const ttfbMs = audits['server-response-time']?.numericValue ? Math.round(audits['server-response-time'].numericValue) : 0;

      return {
        status: 'configured',
        configured: true,
        provider: this.name,
        url,
        strategy,
        metrics: {
          lcp: lcpSec,
          inp: inpMs,
          cls,
          fcp: fcpSec,
          ttfb: ttfbMs,
          performanceScore,
        },
        diagnostics: Object.values(audits)
          .filter((a: any) => a?.details?.type === 'opportunity' || a?.scoreDisplayMode === 'binary')
          .slice(0, 5)
          .map((a: any) => ({
            title: a.title,
            description: a.description,
            score: a.score,
          })),
        analyzedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'not_configured',
        configured: true,
        provider: this.name,
        url,
        strategy,
        message: err?.message || 'Không thể kết nối đến máy chủ PageSpeed Insights',
        analyzedAt: new Date().toISOString(),
      };
    }
  }
}

export const activePageSpeedProvider = new GooglePageSpeedProvider();
