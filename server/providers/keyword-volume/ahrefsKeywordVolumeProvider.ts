import { getAseanCountry } from './countries.ts';
import type { KeywordVolumeProvider } from './types.ts';

interface AhrefsVolumeRow {
  keyword?: unknown;
  country?: unknown;
  volume?: unknown;
  search_volume?: unknown;
  searchVolume?: unknown;
}

function asRows(value: unknown): AhrefsVolumeRow[] {
  if (Array.isArray(value)) return value.filter((item): item is AhrefsVolumeRow => typeof item === 'object' && item !== null);
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  for (const key of ['rows', 'data', 'results', 'result', 'keywords', 'volume_by_country']) {
    if (Array.isArray(record[key])) {
      return (record[key] as unknown[]).filter((item): item is AhrefsVolumeRow => typeof item === 'object' && item !== null);
    }
  }
  return [record as AhrefsVolumeRow];
}

export function normalizeAhrefsVolumeResponse(
  response: unknown,
  keyword: string,
  countries: readonly string[],
): Map<string, number | null> {
  const requested = new Set(countries);
  const volumes = new Map<string, number | null>(countries.map((code) => [code, null]));

  for (const row of asRows(response)) {
    if (typeof row.keyword === 'string' && row.keyword.toLocaleLowerCase() !== keyword.toLocaleLowerCase()) continue;
    if (typeof row.country !== 'string') continue;

    const country = row.country.toUpperCase();
    if (!requested.has(country) || !getAseanCountry(country)) continue;
    const rawVolume = row.volume ?? row.search_volume ?? row.searchVolume;
    if (typeof rawVolume === 'number' && Number.isFinite(rawVolume) && rawVolume >= 0) {
      volumes.set(country, rawVolume);
    }
  }
  return volumes;
}

export class AhrefsKeywordVolumeProvider implements KeywordVolumeProvider {
  readonly id = 'ahrefs' as const;

  isConfigured(): boolean {
    return Boolean(process.env.AHREFS_API_KEY?.trim());
  }

  async fetchVolumes(keyword: string, countries: string[]): Promise<Map<string, number | null>> {
    const apiKey = process.env.AHREFS_API_KEY?.trim();
    if (!apiKey) throw new Error('Ahrefs is not configured.');

    const params = new URLSearchParams({
      keywords: keyword,
      select: 'keyword,country,volume',
    });
    const response = await fetch(`https://api.ahrefs.com/v3/keywords-explorer/volume-by-country?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`Ahrefs Keyword Volume API returned HTTP ${response.status}.`);
    }

    return normalizeAhrefsVolumeResponse(await response.json() as unknown, keyword, countries);
  }
}
