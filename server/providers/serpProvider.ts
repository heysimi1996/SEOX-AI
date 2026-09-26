/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SerpTrackingParams {
  keyword: string;
  country: string; // e.g. "us", "uk", "de"
  language: string; // e.g. "en", "de"
  device: 'desktop' | 'mobile';
  targetDomain?: string;
}

export interface SerpOrganicResult {
  position: number;
  title: string;
  url: string;
  displayedUrl: string;
  snippet: string;
  serpFeatures: string[];
  isTargetDomain: boolean;
}

export interface SerpTrackingResponse {
  status: 'configured' | 'not_configured';
  configured: boolean;
  provider: string;
  keyword: string;
  country: string;
  language: string;
  device: 'desktop' | 'mobile';
  targetDomain?: string;
  foundPosition: number | null;
  foundUrl: string | null;
  change: number; // vs previous check or baseline (0 if first check)
  detectedSerpFeatures: string[];
  organicResults: SerpOrganicResult[];
  trackedAt: string;
  searchEngine: string;
  error?: string;
  message?: string;
}

export interface SerpProvider {
  name: string;
  isConfigured: () => boolean;
  trackKeyword: (params: SerpTrackingParams) => Promise<SerpTrackingResponse>;
}

export class SerpApiAdapter implements SerpProvider {
  name = 'SerpApi';

  isConfigured(): boolean {
    return Boolean(process.env.SERP_API_KEY && process.env.SERP_API_KEY.trim().length > 0);
  }

  async trackKeyword(params: SerpTrackingParams): Promise<SerpTrackingResponse> {
    const { keyword, country, language, device, targetDomain } = params;

    if (!this.isConfigured()) {
      return {
        status: 'not_configured',
        configured: false,
        provider: this.name,
        keyword,
        country,
        language,
        device,
        targetDomain,
        foundPosition: null,
        foundUrl: null,
        change: 0,
        detectedSerpFeatures: [],
        organicResults: [],
        trackedAt: new Date().toISOString(),
        searchEngine: 'Google Search',
        error: 'Chưa kết nối SERP API',
        message: 'Chưa kết nối SERP API. Thêm SERP_API_KEY vào biến môi trường để theo dõi vị trí từ khóa theo thời gian thực.',
      };
    }

    try {
      const apiKey = process.env.SERP_API_KEY;
      const queryParams = new URLSearchParams({
        engine: 'google',
        q: keyword,
        gl: country.toLowerCase(),
        hl: language.toLowerCase(),
        device: device === 'mobile' ? 'mobile' : 'desktop',
        api_key: apiKey || '',
      });

      const res = await fetch(`https://serpapi.com/search.json?${queryParams.toString()}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        throw new Error(`SERP API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const detectedSerpFeatures: string[] = [];

      if (data.answer_box || data.featured_snippet) detectedSerpFeatures.push('Featured Snippet');
      if (data.related_questions && data.related_questions.length > 0) detectedSerpFeatures.push('People Also Ask');
      if (data.local_results || data.places) detectedSerpFeatures.push('Local Pack');
      if (data.inline_videos || data.video_results) detectedSerpFeatures.push('Video Carousel');
      if (data.knowledge_graph) detectedSerpFeatures.push('Knowledge Panel');
      if (data.top_stories) detectedSerpFeatures.push('Top Stories');

      const cleanTarget = targetDomain ? targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase() : null;

      const rawOrganics = data.organic_results || [];
      const organicResults: SerpOrganicResult[] = rawOrganics.slice(0, 20).map((r: any, idx: number) => {
        const itemUrl = r.link || '';
        const itemDomain = itemUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
        const isTarget = cleanTarget ? itemDomain.includes(cleanTarget) : false;

        const itemFeatures: string[] = [];
        if (r.sitelinks) itemFeatures.push('Sitelinks');
        if (r.snippet_highlighted_words) itemFeatures.push('Bold Terms');
        if (r.rich_snippet) itemFeatures.push('Rich Snippet');

        return {
          position: r.position || idx + 1,
          title: r.title || 'Untitled Result',
          url: itemUrl,
          displayedUrl: r.displayed_link || itemUrl,
          snippet: r.snippet || '',
          serpFeatures: itemFeatures,
          isTargetDomain: isTarget,
        };
      });

      const matchedTarget = organicResults.find((r) => r.isTargetDomain);

      return {
        status: 'configured',
        configured: true,
        provider: this.name,
        keyword,
        country,
        language,
        device,
        targetDomain,
        foundPosition: matchedTarget ? matchedTarget.position : null,
        foundUrl: matchedTarget ? matchedTarget.url : null,
        change: 0,
        detectedSerpFeatures,
        organicResults,
        trackedAt: new Date().toISOString(),
        searchEngine: 'Google Search Engine',
      };
    } catch (err: any) {
      return {
        status: 'not_configured',
        configured: false,
        provider: this.name,
        keyword,
        country,
        language,
        device,
        targetDomain,
        foundPosition: null,
        foundUrl: null,
        change: 0,
        detectedSerpFeatures: [],
        organicResults: [],
        trackedAt: new Date().toISOString(),
        searchEngine: 'Google Search',
        error: err?.message || 'Failed to query live SERP provider',
      };
    }
  }
}

export const activeSerpProvider = new SerpApiAdapter();
