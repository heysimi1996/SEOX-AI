import { getAseanCountry, normalizeCountries, validateKeyword } from './countries.ts';
import {
  KEYWORD_VOLUME_PROVIDERS,
  KeywordVolumeError,
  type KeywordVolumeProvider,
  type KeywordVolumeProviderId,
  type KeywordVolumeResult,
} from './types.ts';

function isProviderId(value: string): value is KeywordVolumeProviderId {
  return KEYWORD_VOLUME_PROVIDERS.some((provider) => provider === value);
}

interface CachedResult {
  expiresAt: number;
  result: KeywordVolumeResult;
}

export class KeywordVolumeService {
  private readonly cache = new Map<string, CachedResult>();
  private readonly inFlight = new Map<string, Promise<KeywordVolumeResult>>();
  private readonly history: KeywordVolumeResult[] = [];

  constructor(
    private readonly providers: Record<KeywordVolumeProviderId, KeywordVolumeProvider>,
    private readonly cacheTtlMs = 15 * 60 * 1000,
    private readonly now: () => number = Date.now,
  ) {}

  async getVolume(keywordInput: unknown, countryInput: unknown, providerInput: unknown): Promise<KeywordVolumeResult> {
    let keyword: string;
    let countries: string[];
    try {
      keyword = validateKeyword(keywordInput);
      if (typeof countryInput !== 'string') throw new Error('At least one valid country is required.');
      countries = normalizeCountries(countryInput.split(','));
      if (countries.length === 0) throw new Error('At least one valid country is required.');
    } catch (error) {
      throw new KeywordVolumeError(error instanceof Error ? error.message : 'Invalid request.', 400);
    }

    if (typeof providerInput !== 'string' || !isProviderId(providerInput)) {
      throw new KeywordVolumeError('Provider must be ahrefs or dataforseo.', 400);
    }
    const providerId = providerInput;
    const provider = this.providers[providerId];
    if (!provider.isConfigured()) {
      throw new KeywordVolumeError(`${providerId === 'ahrefs' ? 'Ahrefs' : 'DataForSEO'} is not configured.`, 503);
    }

    const cacheKey = `${providerId}:${keyword.toLocaleLowerCase()}:${countries.join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > this.now()) return cached.result;
    if (cached) this.cache.delete(cacheKey);

    const pending = this.inFlight.get(cacheKey);
    if (pending) return pending;

    const request = provider.fetchVolumes(keyword, countries).then((volumes) => {
      const rows = countries.map((code) => {
        const volume = volumes.get(code) ?? null;
        return {
          country: code,
          countryName: getAseanCountry(code)?.name ?? code,
          volume,
          ...(volume === null ? { note: 'The provider returned no volume for this country; no estimate is inferred.' } : {}),
        };
      });
      const reportedVolumes = rows.flatMap((row) => row.volume === null ? [] : [row.volume]);
      const result: KeywordVolumeResult = {
        success: true,
        keyword,
        provider: providerId,
        countries: rows,
        totalVolume: reportedVolumes.length > 0
          ? reportedVolumes.reduce((total, volume) => total + volume, 0)
          : null,
        isComplete: rows.every((row) => row.volume !== null),
        fetchedAt: new Date(this.now()).toISOString(),
      };
      this.cache.set(cacheKey, { expiresAt: this.now() + this.cacheTtlMs, result });
      this.history.unshift(result);
      this.history.splice(500);
      return result;
    }).finally(() => {
      this.inFlight.delete(cacheKey);
    });
    this.inFlight.set(cacheKey, request);
    return request;
  }

  getHistory(keywordInput?: unknown): KeywordVolumeResult[] {
    const keyword = typeof keywordInput === 'string' ? keywordInput.trim().toLocaleLowerCase() : '';
    return this.history.filter((item) => !keyword || item.keyword.toLocaleLowerCase() === keyword);
  }
}
