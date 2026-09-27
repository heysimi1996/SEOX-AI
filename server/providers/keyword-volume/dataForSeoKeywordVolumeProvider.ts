import {
  ASEAN_COUNTRIES,
  getCountryCodeByDataForSeoLocationCode,
} from './countries.ts';
import type { KeywordVolumeProvider } from './types.ts';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function getVolume(value: unknown): number | null {
  const record = asRecord(value);
  if (!record) return null;
  const keywordInfo = asRecord(record.keyword_info);
  const volume = keywordInfo?.search_volume ?? record.search_volume ?? record.volume;
  return typeof volume === 'number' && Number.isFinite(volume) && volume >= 0 ? volume : null;
}

export function normalizeDataForSeoVolumeResponse(
  response: unknown,
  countries: readonly string[],
): Map<string, number | null> {
  const volumes = new Map<string, number | null>(countries.map((code) => [code, null]));
  const root = asRecord(response);
  const tasks = root && Array.isArray(root.tasks) ? root.tasks : [];

  for (const value of tasks) {
    const task = asRecord(value);
    if (!task) continue;
    const data = asRecord(task.data);
    const taskLocationCode = data?.location_code ?? task.location_code;
    if (typeof taskLocationCode !== 'number') continue;
    const country = getCountryCodeByDataForSeoLocationCode(taskLocationCode);
    if (!country || !volumes.has(country) || !Array.isArray(task.result)) continue;

    const firstResult = task.result[0];
    if (firstResult !== undefined) volumes.set(country, getVolume(firstResult));
  }
  return volumes;
}

export class DataForSeoKeywordVolumeProvider implements KeywordVolumeProvider {
  readonly id = 'dataforseo' as const;

  isConfigured(): boolean {
    return Boolean(process.env.DATAFORSEO_LOGIN?.trim() && process.env.DATAFORSEO_PASSWORD?.trim());
  }

  async fetchVolumes(keyword: string, countries: string[]): Promise<Map<string, number | null>> {
    const login = process.env.DATAFORSEO_LOGIN?.trim();
    const password = process.env.DATAFORSEO_PASSWORD?.trim();
    if (!login || !password) throw new Error('DataForSEO is not configured.');

    const selectedLocations = ASEAN_COUNTRIES.filter(({ code }) => countries.includes(code));
    const credentials = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
    const countryResponses = await Promise.all(selectedLocations.map(async ({ dataForSeoLocationCode }) => {
      const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: { Authorization: credentials, 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          keywords: [keyword],
          location_code: dataForSeoLocationCode,
          language_code: 'en',
        }]),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        throw new Error(`DataForSEO Keyword Volume API returned HTTP ${response.status}.`);
      }

      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (typeof root?.status_code === 'number' && root.status_code >= 40000) {
        throw new Error(`DataForSEO Keyword Volume API returned status ${root.status_code}.`);
      }
      if (Array.isArray(root?.tasks)) {
        for (const value of root.tasks) {
          const task = asRecord(value);
          if (typeof task?.status_code === 'number' && task.status_code >= 40000) {
            throw new Error(`DataForSEO Keyword Volume API returned status ${task.status_code}.`);
          }
        }
      }
      return payload;
    }));
    const volumes = new Map<string, number | null>(countries.map((code) => [code, null]));
    for (const payload of countryResponses) {
      for (const [country, volume] of normalizeDataForSeoVolumeResponse(payload, countries)) {
        volumes.set(country, volume);
      }
    }
    return volumes;
  }
}
