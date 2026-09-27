export const KEYWORD_VOLUME_PROVIDERS = ['ahrefs', 'dataforseo'] as const;
export type KeywordVolumeProviderId = (typeof KEYWORD_VOLUME_PROVIDERS)[number];

export interface KeywordVolumeCountryResult {
  country: string;
  countryName: string;
  volume: number | null;
  note?: string;
}

export interface KeywordVolumeResult {
  success: true;
  keyword: string;
  provider: KeywordVolumeProviderId;
  countries: KeywordVolumeCountryResult[];
  totalVolume: number | null;
  isComplete: boolean;
  fetchedAt: string;
}

export interface KeywordVolumeProvider {
  id: KeywordVolumeProviderId;
  isConfigured(): boolean;
  fetchVolumes(keyword: string, countries: string[]): Promise<Map<string, number | null>>;
}

export class KeywordVolumeError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'KeywordVolumeError';
  }
}
