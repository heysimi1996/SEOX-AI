import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, GitBranch, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';

type RedirectResultStatus = 'PASS' | 'WARNING' | 'ERROR';
interface RedirectHop {
  url: string;
  status: number | null;
  location?: string;
}
interface RedirectCheckResult {
  success: boolean;
  inputUrl: string;
  canonicalDomain: string;
  status: number | null;
  finalUrl: string | null;
  redirectCount: number;
  chain: RedirectHop[];
  responseTimeMs: number;
  result: RedirectResultStatus;
  message: string;
  errorCode?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRedirectResult(value: unknown): value is RedirectCheckResult {
  return isRecord(value)
    && typeof value.success === 'boolean'
    && typeof value.inputUrl === 'string'
    && typeof value.canonicalDomain === 'string'
    && (value.status === null || typeof value.status === 'number')
    && (value.finalUrl === null || typeof value.finalUrl === 'string')
    && typeof value.redirectCount === 'number'
    && Array.isArray(value.chain)
    && typeof value.responseTimeMs === 'number'
    && (value.result === 'PASS' || value.result === 'WARNING' || value.result === 'ERROR')
    && typeof value.message === 'string';
}

const statusStyles: Record<RedirectResultStatus, string> = {
  PASS: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  WARNING: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  ERROR: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

export const RedirectCheckView: React.FC = () => {
  const [url, setUrl] = useState('');
  const [canonicalDomain, setCanonicalDomain] = useState('');
  const [result, setResult] = useState<RedirectCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  let finalLocation: URL | null = null;
  if (result?.finalUrl) {
    try {
      finalLocation = new URL(result.finalUrl);
    } catch {
      finalLocation = null;
    }
  }

  const check = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || !canonicalDomain.trim()) {
      setError('Nhập URL cần kiểm tra và domain chuẩn.');
      return;
    }
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/redirect-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, canonicalDomain }),
      });
      const payload: unknown = await response.json();
      const hasRedirectResult = isRedirectResult(payload);
      if (!response.ok) {
        if (hasRedirectResult) {
          setResult(payload);
          return;
        }
        throw new Error(isRecord(payload) && typeof payload.error === 'string' ? payload.error : 'Không thể kiểm tra redirect.');
      }
      if (!hasRedirectResult) throw new Error('Phản hồi redirect không hợp lệ.');
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể kiểm tra redirect.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00] shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Check Redirect 301 - Kiểm Tra Redirect Domain</h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-3xl">
              Kiểm tra URL có redirect 301 đúng về domain chuẩn, phát hiện redirect sai, redirect chain và các vấn đề có thể ảnh hưởng đến SEO.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={check} className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="redirect-url" className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">URL cần kiểm tra</label>
            <input
              id="redirect-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            />
          </div>
          <div>
            <label htmlFor="canonical-domain" className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Preferred / Canonical Domain</label>
            <input
              id="canonical-domain"
              value={canonicalDomain}
              onChange={(event) => setCanonicalDomain(event.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HTTP/HTTPS only · tối đa 10 redirect hops
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setUrl(''); setCanonicalDomain(''); setResult(null); setError(null); }} className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white text-sm font-semibold flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
              {isLoading ? <><RefreshCw className="w-4 h-4 animate-spin" />Đang kiểm tra redirect...</> : <><ExternalLink className="w-4 h-4" />Check Redirect 301</>}
            </button>
          </div>
        </div>
      </form>

      {error && <div role="alert" className="border border-rose-500/20 bg-rose-500/5 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      {result && (
        <section className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Redirect Health</h2>
              <p className="text-sm text-neutral-300 mt-1">{result.message}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${statusStyles[result.result]}`}>{result.result}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['HTTP status', result.status ?? '—'],
              ['Redirect count', result.redirectCount],
              ['Response time', `${result.responseTimeMs} ms`],
              ['HTTPS', finalLocation ? (finalLocation.protocol === 'https:' ? 'HTTPS' : 'HTTP') : '—'],
              ['Host variant', finalLocation ? (finalLocation.hostname.toLowerCase().startsWith('www.') ? 'www' : 'non-www') : '—'],
              ['Redirect loop', result.errorCode === 'REDIRECT_LOOP' ? 'Detected' : 'Not detected'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#121212] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
                <div className="text-sm text-white font-mono mt-1">{value}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left text-xs">
              <thead><tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider"><th className="pb-3">URL</th><th className="pb-3">Status</th><th className="pb-3">Redirect type</th><th className="pb-3">Location</th></tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {result.chain.map((hop, index) => (
                  <tr key={`${hop.url}-${index}`}>
                    <td className="py-3 text-white font-mono max-w-[280px] truncate" title={hop.url}>{hop.url}</td>
                    <td className="py-3 font-mono text-[#FF8A3D]">{hop.status ?? '—'}</td>
                    <td className="py-3 text-neutral-300">{hop.status && [301, 302, 303, 307, 308].includes(hop.status) ? `${hop.status} ${hop.status === 301 ? 'Permanent' : 'Redirect'}` : 'Final response'}</td>
                    <td className="py-3 text-neutral-400 font-mono max-w-[280px] truncate" title={hop.location}>{hop.location ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 text-xs text-neutral-400">
            {result.result === 'PASS' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>Final URL: <span className="text-neutral-200 font-mono">{result.finalUrl ?? 'Unavailable'}</span></span>
          </div>
        </section>
      )}
    </div>
  );
};
