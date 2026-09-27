export const ASEAN_COUNTRIES = [
  { code: 'VN', name: 'Vietnam', dataForSeoLocationCode: 2380 },
  { code: 'TH', name: 'Thailand', dataForSeoLocationCode: 2764 },
  { code: 'ID', name: 'Indonesia', dataForSeoLocationCode: 2360 },
  { code: 'MY', name: 'Malaysia', dataForSeoLocationCode: 2458 },
  { code: 'SG', name: 'Singapore', dataForSeoLocationCode: 2702 },
  { code: 'PH', name: 'Philippines', dataForSeoLocationCode: 2608 },
  { code: 'KH', name: 'Cambodia', dataForSeoLocationCode: 2116 },
  { code: 'LA', name: 'Laos', dataForSeoLocationCode: 2418 },
  { code: 'MM', name: 'Myanmar', dataForSeoLocationCode: 2104 },
  { code: 'BN', name: 'Brunei', dataForSeoLocationCode: 2100 },
  { code: 'TL', name: 'Timor-Leste', dataForSeoLocationCode: 2626 },
] as const;

export type AseanCountryCode = (typeof ASEAN_COUNTRIES)[number]['code'];

const countryByCode = new Map<string, (typeof ASEAN_COUNTRIES)[number]>(
  ASEAN_COUNTRIES.map((country) => [country.code, country]),
);

export function normalizeCountries(input: readonly string[]): AseanCountryCode[] {
  const normalized = new Set<string>();
  for (const value of input) {
    const code = value.trim().toUpperCase();
    if (!countryByCode.has(code)) {
      throw new Error(`Unsupported country code: ${value}`);
    }
    normalized.add(code);
  }

  return ASEAN_COUNTRIES
    .filter(({ code }) => normalized.has(code))
    .map(({ code }) => code);
}

export function getAseanCountry(code: string) {
  return countryByCode.get(code.toUpperCase());
}

export function getDataForSeoLocationCode(countryCode: string): number | undefined {
  return getAseanCountry(countryCode)?.dataForSeoLocationCode;
}

export function getCountryCodeByDataForSeoLocationCode(locationCode: number): AseanCountryCode | undefined {
  return ASEAN_COUNTRIES.find((country) => country.dataForSeoLocationCode === locationCode)?.code;
}

export function validateKeyword(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Keyword must be a string.');
  }
  const keyword = value.trim();
  if (!keyword || keyword.length > 80 || /[\u0000-\u001f\u007f]/u.test(keyword)) {
    throw new Error('Keyword must contain 1–80 printable characters.');
  }
  if (keyword.split(/\s+/u).length > 10) {
    throw new Error('Keyword cannot contain more than 10 words.');
  }
  return keyword;
}
