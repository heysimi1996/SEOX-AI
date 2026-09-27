import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, RefreshCw } from 'lucide-react';

const ASEAN_COUNTRIES = [
  { code: 'vn', name: 'Vietnam' },
  { code: 'th', name: 'Thailand' },
  { code: 'id', name: 'Indonesia' },
  { code: 'my', name: 'Malaysia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ph', name: 'Philippines' },
  { code: 'kh', name: 'Cambodia' },
  { code: 'la', name: 'Laos' },
  { code: 'mm', name: 'Myanmar' },
  { code: 'bn', name: 'Brunei' },
  { code: 'tl', name: 'Timor-Leste' },
] as const;

type ProviderId = 'ahrefs' | 'dataforseo';
interface CountryVolume {
  country: string;
  countryName: string;
  volume: number | null;
  note?: string;
}
interface VolumeResult {
  success: true;
  keyword: string;
  provider: ProviderId;
  countries: CountryVolume[];
  totalVolume: number | null;
  isComplete: boolean;
  fetchedAt: string;
}
interface ProviderStatus {
  ahrefs: { configured: boolean };
  dataforseo: { configured: boolean };
}

const numberFormatter = new Intl.NumberFormat();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProviderStatus(value: unknown): value is ProviderStatus {
  return isRecord(value)
    && isRecord(value.ahrefs)
    && typeof value.ahrefs.configured === 'boolean'
    && isRecord(value.dataforseo)
    && typeof value.dataforseo.configured === 'boolean';
}

function isVolumeResult(value: unknown): value is VolumeResult {
  return isRecord(value)
    && value.success === true
    && typeof value.keyword === 'string'
    && (value.provider === 'ahrefs' || value.provider === 'dataforseo')
    && Array.isArray(value.countries)
    && value.countries.every((country: unknown) => isRecord(country)
      && typeof country.country === 'string'
      && typeof country.countryName === 'string'
      && (country.volume === null || typeof country.volume === 'number'))
    && (value.totalVolume === null || typeof value.totalVolume === 'number')
    && typeof value.isComplete === 'boolean'
    && typeof value.fetchedAt === 'string';
}

export const KeywordVolumeView: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [provider, setProvider] = useState<ProviderId>('ahrefs');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(ASEAN_COUNTRIES.map(({ code }) => code));
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [result, setResult] = useState<VolumeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/status')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load provider configuration.');
        const data: unknown = await response.json();
        const volumeStatus = isRecord(data) ? data.keywordVolume : null;
        setProviderStatus(isProviderStatus(volumeStatus) ? volumeStatus : null);
      })
      .catch(() => setProviderStatus(null));
  }, []);

  const toggleCountry = (code: string) => {
    setSelectedCountries((current) => current.includes(code)
      ? current.filter((country) => country !== code)
      : [...current, code]);
  };

  const checkVolume = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!keyword.trim()) {
      setError('Enter a keyword to check.');
      return;
    }
    if (selectedCountries.length === 0) {
      setError('Select at least one country.');
      return;
    }

    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        keyword: keyword.trim(),
        countries: selectedCountries.join(','),
        provider,
      });
      const response = await fetch(`/api/keywords/volume?${query}`);
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = isRecord(data) && typeof data.error === 'string' ? data.error : 'Keyword volume lookup failed.';
        throw new Error(message);
      }
      if (!isVolumeResult(data)) throw new Error('Keyword volume response was invalid.');
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Keyword volume lookup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyAseanPreset = () => setSelectedCountries(ASEAN_COUNTRIES.map(({ code }) => code));
  const configured = providerStatus?.[provider].configured;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Keyword Volume</h2>
            <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
              Check provider-reported monthly search volume for a keyword across Southeast Asia.
            </p>
            <p className="text-xs text-neutral-500 mt-2">Search volume is an estimate provided by the selected data source, not an exact count.</p>
          </div>
        </div>
      </div>

      <form onSubmit={checkVolume} className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
          <div>
            <label htmlFor="volume-keyword" className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Keyword
            </label>
            <input
              id="volume-keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              maxLength={80}
              required
              placeholder="e.g. seo audit"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            />
          </div>
          <div>
            <label htmlFor="volume-provider" className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Provider
            </label>
            <select
              id="volume-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value === 'dataforseo' ? 'dataforseo' : 'ahrefs')}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            >
              <option value="ahrefs">Ahrefs</option>
              <option value="dataforseo">DataForSEO</option>
            </select>
            {configured === false && <p className="text-amber-400 text-xs mt-1.5">{provider === 'ahrefs' ? 'Ahrefs' : 'DataForSEO'} is not configured.</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Countries</label>
            <button
              type="button"
              onClick={applyAseanPreset}
              className="px-3 py-1.5 rounded-lg border border-[#FF5E00]/30 bg-[#FF5E00]/10 text-[#FF8A3D] hover:bg-[#FF5E00]/20 text-xs font-semibold transition-colors"
            >
              Đông Nam Á
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {ASEAN_COUNTRIES.map(({ code, name }) => (
              <label key={code} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#121212] px-3 py-2 text-sm text-neutral-300 hover:border-white/15">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(code)}
                  onChange={() => toggleCountry(code)}
                  className="accent-[#FF5E00]"
                />
                <span>{name}</span>
                <span className="ml-auto font-mono text-[11px] text-neutral-500">{code.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <><RefreshCw className="w-4 h-4 animate-spin" />Checking volume...</> : 'Kiểm tra Volume'}
        </button>
      </form>

      {error && (
        <div role="alert" className="border border-rose-500/20 bg-rose-500/5 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <section className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Monthly search volume: “{result.keyword}”</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {result.provider === 'ahrefs' ? 'Ahrefs' : 'DataForSEO'} estimate · Updated {new Date(result.fetchedAt).toLocaleString()}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                {result.isComplete ? 'Total regional volume' : 'Total of reported country values'}
              </div>
              <div className="text-2xl font-bold font-mono text-[#FF8A3D]">
                {result.totalVolume === null ? 'No data' : numberFormatter.format(result.totalVolume)}
              </div>
            </div>
          </div>

          {!result.isComplete && (
            <p className="text-xs text-amber-300 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
              Some selected countries returned no volume. Their values are shown as “No data”; the total includes only reported country values and is not a complete regional estimate.
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Country</th>
                  <th className="pb-3 font-semibold">Monthly volume</th>
                  <th className="pb-3 font-semibold">Data status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {result.countries.map((country) => (
                  <tr key={country.country}>
                    <td className="py-3 text-white">{country.countryName} <span className="text-neutral-500 font-mono text-xs">{country.country}</span></td>
                    <td className="py-3 font-mono text-[#FF8A3D]">
                      {country.volume === null ? '—' : numberFormatter.format(country.volume)}
                    </td>
                    <td className="py-3 text-xs">
                      {country.volume === null
                        ? <span className="text-neutral-500" title={country.note}>No data returned</span>
                        : <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Provider data</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
