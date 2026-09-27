import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCountries, validateKeyword } from './countries.ts';
import { normalizeAhrefsVolumeResponse } from './ahrefsKeywordVolumeProvider.ts';
import { normalizeDataForSeoVolumeResponse } from './dataForSeoKeywordVolumeProvider.ts';
import { KeywordVolumeService } from './keywordVolumeService.ts';
import type { KeywordVolumeProvider, KeywordVolumeProviderId } from './types.ts';

test('validates keyword input and trims surrounding whitespace', () => {
  assert.equal(validateKeyword('  seo audit  '), 'seo audit');
  assert.throws(() => validateKeyword('  '), /1–80 printable characters/u);
  assert.throws(() => validateKeyword('x'.repeat(81)), /1–80 printable characters/u);
  assert.throws(() => validateKeyword('one two three four five six seven eight nine ten eleven'), /10 words/u);
});

test('validates and normalizes country codes, preserving ASEAN preset order', () => {
  assert.deepEqual(normalizeCountries(['th', 'VN', 'th']), ['VN', 'TH']);
  assert.throws(() => normalizeCountries(['US']), /Unsupported country code/u);
});

test('normalizes Ahrefs volumes and leaves unreturned countries unknown', () => {
  const normalized = normalizeAhrefsVolumeResponse({
    rows: [
      { keyword: 'bj88', country: 'VN', volume: 52000 },
      { keyword: 'unrelated', country: 'TH', volume: 999 },
      { keyword: 'bj88', country: 'TH', volume: null },
    ],
  }, 'bj88', ['VN', 'TH', 'ID']);

  assert.deepEqual([...normalized.entries()], [['VN', 52000], ['TH', null], ['ID', null]]);
});

test('normalizes DataForSEO location tasks without inventing missing volumes', () => {
  const normalized = normalizeDataForSeoVolumeResponse({
    tasks: [
      { data: { location_code: 2380 }, result: [{ keyword: 'bj88', keyword_info: { search_volume: 52000 } }] },
      { data: { location_code: 2764 }, result: [{ keyword: 'bj88', keyword_info: { search_volume: null } }] },
    ],
  }, ['VN', 'TH', 'ID']);

  assert.deepEqual([...normalized.entries()], [['VN', 52000], ['TH', null], ['ID', null]]);
});

test('returns an explicit unavailable configuration error', async () => {
  const provider: KeywordVolumeProvider = {
    id: 'ahrefs',
    isConfigured: () => false,
    fetchVolumes: async () => new Map(),
  };
  const service = new KeywordVolumeService({
    ahrefs: provider,
    dataforseo: { ...provider, id: 'dataforseo' },
  } satisfies Record<KeywordVolumeProviderId, KeywordVolumeProvider>);

  await assert.rejects(
    service.getVolume('seo', 'vn', 'ahrefs'),
    (error: unknown) => error instanceof Error && error.message === 'Ahrefs is not configured.',
  );
});

test('reports missing country values as null without turning an all-missing total into zero', async () => {
  const provider: KeywordVolumeProvider = {
    id: 'ahrefs',
    isConfigured: () => true,
    fetchVolumes: async () => new Map([['VN', null]]),
  };
  const service = new KeywordVolumeService({
    ahrefs: provider,
    dataforseo: { ...provider, id: 'dataforseo' },
  });
  const result = await service.getVolume('seo', 'vn', 'ahrefs');

  assert.equal(result.countries[0].volume, null);
  assert.match(result.countries[0].note ?? '', /no estimate is inferred/u);
  assert.equal(result.totalVolume, null);
});

test('caches and deduplicates requests for the same provider selection', async () => {
  let calls = 0;
  let currentTime = 1_800_000_000_000;
  const provider: KeywordVolumeProvider = {
    id: 'ahrefs',
    isConfigured: () => true,
    fetchVolumes: async (_keyword, countries) => {
      calls += 1;
      await Promise.resolve();
      return new Map(countries.map((country) => [country, country === 'VN' ? 100 : null]));
    },
  };
  const service = new KeywordVolumeService({
    ahrefs: provider,
    dataforseo: { ...provider, id: 'dataforseo' },
  }, 1000, () => currentTime);

  const [first, concurrent] = await Promise.all([
    service.getVolume('seo', 'vn,th', 'ahrefs'),
    service.getVolume('seo', 'TH,VN', 'ahrefs'),
  ]);
  assert.equal(calls, 1);
  assert.equal(first, concurrent);
  assert.deepEqual(first.countries.map(({ country }) => country), ['VN', 'TH']);
  assert.equal(first.totalVolume, 100);
  assert.equal(first.countries[1].volume, null);
  await service.getVolume('seo', 'vn,th', 'ahrefs');
  assert.equal(calls, 1);

  currentTime += 1001;
  await service.getVolume('seo', 'vn,th', 'ahrefs');
  assert.equal(calls, 2);
});
