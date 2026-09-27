import { AhrefsKeywordVolumeProvider } from './ahrefsKeywordVolumeProvider.ts';
import { DataForSeoKeywordVolumeProvider } from './dataForSeoKeywordVolumeProvider.ts';
import { KeywordVolumeService } from './keywordVolumeService.ts';

export const keywordVolumeProviders = {
  ahrefs: new AhrefsKeywordVolumeProvider(),
  dataforseo: new DataForSeoKeywordVolumeProvider(),
};

export const keywordVolumeService = new KeywordVolumeService(keywordVolumeProviders);
