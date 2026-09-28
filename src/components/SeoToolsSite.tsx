import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Braces,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCode2,
  FileSearch,
  Globe2,
  Layers3,
  Link2,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Wrench,
  X,
} from 'lucide-react';
import { seoToolPages, SEO_TOOLS_BASE, type SeoToolPage } from '../data/seoTools';
import type { PageAuditData } from '../rules/types';
import { getSeoPageMetadata } from '../data/seoPageMetadata';
import { getMetaFieldStatus, hasAuditedScore } from '../data/seoPageQuality';

const KeywordVolumeView = lazy(() => import('./app/views/KeywordVolumeView').then(({ KeywordVolumeView: component }) => ({ default: component })));
const BacklinksView = lazy(() => import('./app/views/BacklinksView').then(({ BacklinksView: component }) => ({ default: component })));
const RedirectCheckView = lazy(() => import('./app/views/RedirectCheckView').then(({ RedirectCheckView: component }) => ({ default: component })));

const iconBySlug = {
  'seo-checker': Search,
  'technical-seo-checker': ShieldCheck,
  'on-page-seo-checker': FileSearch,
  'keyword-research': Sparkles,
  'keyword-volume': BarChart3,
  'backlink-checker': Link2,
  'redirect-checker': Waypoints,
  'domain-checker': Globe2,
  'website-analyzer': Activity,
  'meta-tag-checker': FileCode2,
  'schema-checker': Braces,
  'sitemap-checker': Layers3,
} satisfies Record<string, React.ComponentType<{ className?: string }>>;

function useSeoMetadata(path: string) {
  useEffect(() => {
    const metadata = getSeoPageMetadata(path);
    if (!metadata) return;
    document.title = metadata.title;
    document.documentElement.lang = 'en';
    const setMeta = (selector: string, attribute: 'content' | 'href', value: string, create: () => HTMLElement) => {
      let element = document.head.querySelector<HTMLElement>(selector);
      if (!element) {
        element = create();
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', 'content', metadata.description, () => {
      const meta = document.createElement('meta');
      meta.name = 'description';
      return meta;
    });
    setMeta('link[rel="canonical"]', 'href', metadata.canonical, () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    });
    setMeta('meta[property="og:title"]', 'content', metadata.title, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    });
    setMeta('meta[property="og:description"]', 'content', metadata.description, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    });
    setMeta('meta[property="og:url"]', 'content', metadata.canonical, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    });
    setMeta('meta[name="twitter:url"]', 'content', metadata.canonical, () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:url';
      return meta;
    });
  }, [path]);
}

function ToolDropdown({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const list = seoToolPages;
  if (mobile) {
    return (
      <div className="border-t border-white/[0.08] pt-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="w-full min-h-11 flex items-center justify-between text-left text-sm font-semibold text-white"
        >
          SEO Tools <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="grid gap-1 pb-2">
            {seoToolPages.map((tool) => (
              <a key={tool.slug} href={tool.path} className="min-h-11 flex items-center px-3 rounded-lg text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white">
                {tool.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        aria-expanded={open}
        className="min-h-10 inline-flex items-center gap-1.5 px-3 text-sm font-semibold text-neutral-300 hover:text-white"
      >
        SEO Tools <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <nav aria-label="SEO Tools" className="absolute top-full right-0 z-50 mt-2 w-[min(44rem,calc(100vw-2rem))] max-h-[75vh] overflow-y-auto rounded-xl border border-white/10 bg-[#101010] p-3 shadow-2xl shadow-black/50">
          <a href={SEO_TOOLS_BASE} className="mb-2 flex items-center justify-between rounded-lg bg-[#FF5E00]/10 px-3 py-2.5 text-sm font-bold text-[#FF8A3D]">
            All free SEO tools <ArrowRight className="w-4 h-4" />
          </a>
          <div className="grid grid-cols-2 gap-1">
            {list.map((tool) => (
              <a key={tool.slug} href={tool.path} className="rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white">
                {tool.name}
              </a>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function ToolsHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080808]/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight text-white" aria-label="SEOX AI home">
          <img src="/logo-seox-ai.png" alt="SEOX AI" className="h-8 w-auto max-w-[180px] object-contain drop-shadow-[0_0_12px_rgba(255,126,2,0.5)]" />
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          <a href="/" className="px-3 py-2 text-sm text-neutral-300 hover:text-white">Home</a>
          <ToolDropdown />
          <a href="/entity-manager" className="px-3 py-2 text-sm text-neutral-300 hover:text-white">Entity Manager</a>
          <a href={`${SEO_TOOLS_BASE}seo-checker/`} className="rounded-lg bg-[#FF5E00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#FF6A1A]">Open SEO Checker</a>
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-neutral-200 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <nav className="border-t border-white/[0.08] bg-[#0D0D0D] px-4 py-3 md:hidden">
          <a href="/" className="flex min-h-11 items-center text-sm text-neutral-300">Home</a>
          <ToolDropdown mobile />
          <a href="/entity-manager" className="flex min-h-11 items-center text-sm text-neutral-300 hover:text-white">Entity Manager</a>
          <a href={`${SEO_TOOLS_BASE}seo-checker/`} className="mt-2 flex min-h-11 items-center justify-center rounded-lg bg-[#FF5E00] px-4 text-sm font-bold text-white">Open SEO Checker</a>
        </nav>
      )}
    </header>
  );
}

interface AuditResponse {
  pageData: PageAuditData;
  ruleEvaluations: Array<{ rule: { name: string; category: string; severity: string }; passed: boolean; evidence: string; recommendedFix: string }>;
  healthScore: { score: number; counts: { critical: number; high: number; medium: number; low: number; passed: number; total: number } };
}

function UrlAuditTool({ tool }: { tool: SeoToolPage }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch('/api/audit/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== 'object' || !('pageData' in payload)) {
        const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'The page audit could not be completed.';
        throw new Error(message);
      }
      setResult(payload as AuditResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The page audit could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:flex-row sm:items-end sm:p-5">
        <label className="min-w-0 flex-1 text-sm font-semibold text-neutral-200">
          Page URL
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 text-sm font-normal text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00]"
          />
        </label>
        <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#FF5E00] px-5 text-sm font-bold text-white hover:bg-[#FF6A1A] disabled:opacity-50">
          {loading ? <><Activity className="h-4 w-4 animate-pulse" /> Checking live page…</> : <><Search className="h-4 w-4" /> Check URL</>}
        </button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
        {tool.auditFocus === 'meta' ? `Error — Unavailable because provider/network request failed. ${error}` : error}
      </p>}
      {result && <AuditResults result={result} focus={tool.auditFocus ?? 'all'} />}
      <p className="text-xs leading-5 text-neutral-500">Live check of this URL only. SEOX AI does not invent missing measurements or predict rankings.</p>
    </div>
  );
}

function AuditResults({ result, focus }: { result: AuditResponse; focus: NonNullable<SeoToolPage['auditFocus']> }) {
  const page = result.pageData;
  const failed = result.ruleEvaluations.filter((rule) => !rule.passed);
  const scoreAvailable = hasAuditedScore(result.healthScore.score, result.healthScore.counts.total);
  const metaFields: Array<[string, string | string[] | null | undefined]> = [
    ['Title', page.title],
    ['Description', page.metaDescription],
    ['Canonical', page.canonical],
    ['Robots', page.robotsMeta],
    ['Open Graph title', page.openGraph['og:title']],
    ['Open Graph description', page.openGraph['og:description']],
    ['Open Graph URL', page.openGraph['og:url']],
    ['Open Graph image', page.openGraph['og:image']],
    ['Open Graph type', page.openGraph['og:type']],
    ['Twitter card', page.twitterCard['twitter:card']],
    ['Twitter title', page.twitterCard['twitter:title']],
    ['Twitter description', page.twitterCard['twitter:description']],
    ['Twitter image', page.twitterCard['twitter:image']],
    ['Twitter URL', page.twitterCard['twitter:url']],
    ['Viewport', page.viewport],
    ['Hreflang', page.hreflangs.map(({ lang, href }) => `${lang}: ${href}`)],
  ];
  const rows: Array<[string, string]> = [];
  if (focus === 'all' || focus === 'technical' || focus === 'website') {
    rows.push(
      ['HTTP status', `${page.status} ${page.statusText}`],
      ['HTTPS', page.isHttps ? 'Yes' : 'No'],
      ['Response time', `${page.responseTimeMs} ms`],
      ['Final URL', page.finalUrl || 'Not returned'],
      ['Canonical', page.canonical || 'Not present'],
      ['Robots', page.robotsMeta || 'Not present'],
      ['Redirects', String(page.redirects.length)],
    );
  }
  if (focus === 'all' || focus === 'on-page' || focus === 'meta') {
    rows.push(
      ['Title', page.title || 'Not present'],
      ['Meta description', page.metaDescription || 'Not present'],
      ['H1 headings', page.headings.h1.join(' · ') || 'Not present'],
      ['Word count', String(page.wordCount)],
      ['Internal / external links', `${page.links.totalInternal} / ${page.links.totalExternal}`],
      ['Images without alt', String(page.images.filter((image) => !image.hasAlt).length)],
    );
  }
  if (focus === 'all') {
    rows.push(
      ['Open Graph title', page.openGraph['og:title'] || 'Not present'],
      ['Open Graph description', page.openGraph['og:description'] || 'Not present'],
      ['Open Graph image', page.openGraph['og:image'] || 'Not present'],
      ['Twitter Card', page.twitterCard['twitter:card'] || 'Not present'],
      ['Viewport', page.viewport || 'Not present'],
    );
  }
  if (focus === 'all' || focus === 'technical') {
    rows.push(
      ['Structured data blocks', String(page.jsonLd.length)],
      ['Security headers', `${Object.values(page.securityHeaders).filter(Boolean).length} present`],
    );
  }
  return (
    <section aria-live="polite" className="space-y-4 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">Live results</h2>
          <p className="mt-1 break-all text-xs text-neutral-400">{page.finalUrl}</p>
          {focus === 'website' && <p className="mt-2 text-xs font-medium text-[#FF8A3D]">Based on crawler analysis · Source: fetched page HTML</p>}
          {focus === 'meta' && <p className="mt-2 text-xs font-medium text-[#FF8A3D]">
            {/(?:text\/html|application\/xhtml\+xml)/iu.test(page.contentType)
              ? 'Source: Fetched from page HTML'
              : 'Unavailable because fetched response was not HTML.'}
          </p>}
        </div>
        <div className="rounded-lg border border-[#FF5E00]/25 bg-[#FF5E00]/10 px-3 py-2 text-sm font-bold text-[#FF8A3D]">
          {scoreAvailable ? `${result.healthScore.score}/100 · ${result.healthScore.counts.total} checks` : 'Insufficient data'}
        </div>
      </div>
      {focus === 'meta' ? (
        <dl className="grid gap-x-5 sm:grid-cols-2">
          {metaFields.map(([label, value]) => {
            const status = getMetaFieldStatus(value, page.contentType);
            const displayValue = Array.isArray(value) ? value.join(' · ') : value?.trim() || '—';
            const statusClass = status === 'Available' ? 'text-emerald-300' : status === 'Missing' ? 'text-amber-300' : 'text-neutral-400';
            return <div key={label} className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)] gap-3 border-t border-white/[0.06] py-2.5 text-sm">
              <dt className="text-neutral-400">{label}</dt>
              <dd className="min-w-0 break-words text-neutral-100">
                <span className={statusClass}>{status}</span>
                <span className="ml-2">{displayValue}</span>
              </dd>
            </div>;
          })}
        </dl>
      ) : (
        <dl className="grid gap-x-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)] gap-3 border-t border-white/[0.06] py-2.5 text-sm">
              <dt className="text-neutral-400">{label}</dt>
              <dd className="break-words text-neutral-100">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="border-t border-white/[0.06] pt-3">
        <h3 className="text-sm font-bold text-white">Checks needing review</h3>
        {failed.length ? (
          <ul className="mt-2 space-y-2">
            {failed.map((item) => <li key={item.rule.name} className="rounded-lg bg-[#121212] p-3 text-sm">
              <span className="font-semibold text-amber-300">{item.rule.name}</span>
              <p className="mt-1 text-neutral-300">{item.evidence}</p>
              <p className="mt-1 text-xs text-neutral-500">{item.recommendedFix}</p>
            </li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-emerald-300">No issues were reported by these checks.</p>}
      </div>
    </section>
  );
}

interface Idea {
  keyword: string;
  intent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  cluster: string;
}

function KeywordIdeasTool() {
  const [seed, setSeed] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setIdeas([]);
    try {
      const response = await fetch('/api/keywords/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        throw new Error(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Keyword ideas are unavailable.');
      }
      if (!payload || typeof payload !== 'object' || !('ideas' in payload) || !Array.isArray(payload.ideas)) throw new Error('The keyword idea response was invalid.');
      setIdeas(payload.ideas as Idea[]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Keyword ideas are unavailable.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-semibold text-neutral-200">Seed keyword
          <input value={seed} maxLength={80} required onChange={(event) => setSeed(event.target.value)} placeholder="e.g. technical SEO audit" className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 text-sm font-normal text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00]" />
        </label>
        <button disabled={loading} className="min-h-12 rounded-lg bg-[#FF5E00] px-5 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Generating suggestions…' : 'Generate keyword ideas'}</button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">{error}</p>}
      {!!ideas.length && <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0D0D0D]">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-neutral-400"><tr><th className="p-3">Suggestion</th><th className="p-3">Intent</th><th className="p-3">Topic group</th></tr></thead>
          <tbody>{ideas.map((idea, index) => <tr key={`${idea.keyword}-${index}`} className="border-b border-white/[0.05]"><td className="p-3 text-white">{idea.keyword}</td><td className="p-3 capitalize text-neutral-300">{idea.intent}</td><td className="p-3 text-neutral-300">{idea.cluster}</td></tr>)}</tbody>
        </table>
        <p className="p-3 text-xs text-neutral-500">AI-generated topic suggestions only. No search volume, CPC or competition metrics are included.</p>
      </div>}
    </div>
  );
}

interface DomainLookup {
  domain: string;
  dns: { a: string[]; aaaa: string[]; mx: Array<{ exchange: string; priority: number }>; txt: string[]; ns: string[] };
  ssl: { issuer: string; validFrom: string; validUntil: string; daysRemaining: number } | null;
}

function DomainCheckerTool() {
  const [domain, setDomain] = useState('');
  const [data, setData] = useState<DomainLookup | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const check = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const hostname = domain.trim().replace(/^https?:\/\//iu, '').split('/')[0];
      const response = await fetch(`/api/domain/lookup?domain=${encodeURIComponent(hostname)}`);
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Domain lookup failed.');
      setData(payload as DomainLookup);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Domain lookup failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={check} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-semibold text-neutral-200">Domain
          <input value={domain} required onChange={(event) => setDomain(event.target.value)} placeholder="example.com" className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 text-sm font-normal text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00]" />
        </label>
        <button disabled={loading} className="min-h-12 rounded-lg bg-[#FF5E00] px-5 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Checking public DNS and TLS…' : 'Check domain'}</button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">{error}</p>}
      {data && <section aria-live="polite" className="space-y-4 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:p-5">
        <h2 className="font-bold text-white">Live domain results: {data.domain}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['a', 'aaaa', 'mx', 'ns'] as const).map((kind) => <div key={kind} className="rounded-lg bg-[#121212] p-3">
            <h3 className="text-xs font-bold uppercase text-[#FF8A3D]">{kind} records</h3>
            <ul className="mt-2 space-y-1 break-all text-sm text-neutral-200">
              {data.dns[kind].length ? data.dns[kind].map((entry, index) => <li key={`${kind}-${index}`}>{typeof entry === 'string' ? entry : `${entry.exchange} (priority ${entry.priority})`}</li>) : <li className="text-neutral-500">No records returned</li>}
            </ul>
          </div>)}
          <div className="rounded-lg bg-[#121212] p-3">
            <h3 className="text-xs font-bold uppercase text-[#FF8A3D]">TLS certificate</h3>
            {data.ssl ? <p className="mt-2 text-sm text-neutral-200">{data.ssl.issuer}<br />Valid through {data.ssl.validUntil}<br />{data.ssl.daysRemaining} days remaining</p> : <p className="mt-2 text-sm text-neutral-400">No certificate details returned by the TLS check.</p>}
          </div>
          <div className="rounded-lg bg-[#121212] p-3">
            <h3 className="text-xs font-bold uppercase text-[#FF8A3D]">TXT records</h3>
            <ul className="mt-2 space-y-1 break-all text-sm text-neutral-200">{data.dns.txt.length ? data.dns.txt.map((entry, index) => <li key={`txt-${index}`}>{entry}</li>) : <li className="text-neutral-500">No records returned</li>}</ul>
          </div>
        </div>
        <p className="text-xs text-neutral-500">Public DNS and TLS details only. WHOIS registrant information is not queried.</p>
      </section>}
    </div>
  );
}

function SchemaCheckerTool() {
  const [mode, setMode] = useState<'json' | 'url'>('json');
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const validate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setParsed(null);
    setAudit(null);
    if (mode === 'json') {
      try {
        const value: unknown = JSON.parse(input);
        if (!value || typeof value !== 'object') throw new Error('JSON-LD must be a JSON object.');
        setParsed(value);
      } catch (issue) {
        setError(issue instanceof Error ? issue.message : 'Invalid JSON.');
      }
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/audit/quick', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: input }) });
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== 'object' || !('pageData' in payload)) throw new Error(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Schema URL check failed.');
      setAudit(payload as AuditResponse);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Schema URL check failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Schema input method">
        {(['json', 'url'] as const).map((kind) => <button key={kind} type="button" aria-pressed={mode === kind} onClick={() => { setMode(kind); setError(''); setParsed(null); setAudit(null); }} className={`min-h-10 rounded-lg px-4 text-sm font-semibold ${mode === kind ? 'bg-[#FF5E00] text-white' : 'border border-white/10 bg-[#0D0D0D] text-neutral-300'}`}>{kind === 'json' ? 'Paste JSON-LD' : 'Inspect a URL'}</button>)}
      </div>
      <form onSubmit={validate} className="space-y-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-4">
        {mode === 'json'
          ? <label className="block text-sm font-semibold text-neutral-200">JSON-LD
            <textarea value={input} required onChange={(event) => setInput(event.target.value)} rows={8} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'} className="mt-2 w-full rounded-lg border border-white/10 bg-[#080808] p-3 font-mono text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#FF5E00]" />
          </label>
          : <label className="block text-sm font-semibold text-neutral-200">Public page URL
            <input type="url" value={input} required onChange={(event) => setInput(event.target.value)} placeholder="https://example.com/page" className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 text-sm font-normal text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00]" />
          </label>}
        <button disabled={loading} className="min-h-11 rounded-lg bg-[#FF5E00] px-5 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Inspecting…' : 'Validate structured data'}</button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">{error}</p>}
      {parsed !== null && <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
        <h2 className="font-bold text-emerald-300">Valid JSON syntax</h2>
        <p className="mt-2 text-neutral-200">@context: {typeof parsed === 'object' && parsed !== null && '@context' in parsed ? String(parsed['@context']) : 'Not present'}</p>
        <p className="mt-1 text-neutral-200">@type: {typeof parsed === 'object' && parsed !== null && '@type' in parsed ? String(parsed['@type']) : 'Not present'}</p>
        <p className="mt-2 text-xs text-neutral-400">JSON syntax validation only; confirm schema properties and eligibility using search engine guidance.</p>
      </section>}
      {audit && <section className="rounded-xl border border-white/10 bg-[#0D0D0D] p-4">
        <h2 className="font-bold text-white">Structured data found: {audit.pageData.jsonLd.length}</h2>
        <ul className="mt-3 space-y-3">{audit.pageData.jsonLd.map((schema, index) => <li key={`schema-${index}`} className="rounded-lg bg-[#121212] p-3 text-sm">
          <p className={schema.isValid ? 'text-emerald-300' : 'text-rose-300'}>{schema.isValid ? 'Valid JSON syntax' : schema.error || 'Invalid JSON'}</p>
          <p className="mt-1 text-neutral-200">Detected types: {schema.types.join(', ') || 'None'}</p>
        </li>)}</ul>
      </section>}
    </div>
  );
}

interface SitemapAudit {
  domain: string;
  robotsTxt: { found: boolean; content: string | null; sitemapsDeclared: string[] };
  sitemap: { found: boolean; urlsCount: number; hasIndex: boolean; status: number | null; contentType: string | null; validXml: boolean; lastmodCount: number; invalidUrls: string[]; mixedContentUrls: string[]; inconsistentHostUrls: string[] };
}

function SitemapCheckerTool() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<SitemapAudit | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const check = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const host = domain.trim().replace(/^https?:\/\//iu, '').split('/')[0];
      const response = await fetch(`/api/audit/robots-sitemap?domain=${encodeURIComponent(host)}`);
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Sitemap check failed.');
      setResult(payload as SitemapAudit);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Sitemap check failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={check} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-semibold text-neutral-200">Website domain
          <input value={domain} required onChange={(event) => setDomain(event.target.value)} placeholder="example.com" className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 text-sm font-normal text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00]" />
        </label>
        <button disabled={loading} className="min-h-12 rounded-lg bg-[#FF5E00] px-5 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Fetching robots and sitemap…' : 'Check sitemap'}</button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">{error}</p>}
      {result && <section className="space-y-4 rounded-xl border border-white/10 bg-[#0D0D0D] p-4 sm:p-5">
        <h2 className="font-bold text-white">Live sitemap inspection for {result.domain}</h2>
        <dl className="grid gap-x-5 sm:grid-cols-2">
          {[
            ['robots.txt', result.robotsTxt.found ? 'Found' : 'Not found'],
            ['Sitemaps declared', String(result.robotsTxt.sitemapsDeclared.length)],
            ['Sitemap response', result.sitemap.status === null ? 'No response' : String(result.sitemap.status)],
            ['Content type', result.sitemap.contentType || 'Not returned'],
            ['XML validity', result.sitemap.validXml ? 'Valid XML structure' : 'Invalid or unavailable'],
            ['URL entries', String(result.sitemap.urlsCount)],
            ['lastmod entries', String(result.sitemap.lastmodCount)],
            ['Sitemap index', result.sitemap.hasIndex ? 'Yes' : 'No'],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] gap-3 border-t border-white/[0.06] py-2.5 text-sm"><dt className="text-neutral-400">{label}</dt><dd className="break-words text-neutral-100">{value}</dd></div>)}
        </dl>
        {result.sitemap.invalidUrls.length > 0 && <p className="text-sm text-amber-200">Invalid URL entries: {result.sitemap.invalidUrls.join(', ')}</p>}
        {result.sitemap.mixedContentUrls.length > 0 && <p className="text-sm text-amber-200">HTTP URLs on an HTTPS sitemap: {result.sitemap.mixedContentUrls.join(', ')}</p>}
        {result.sitemap.inconsistentHostUrls.length > 0 && <p className="text-sm text-amber-200">URLs using a different host: {result.sitemap.inconsistentHostUrls.join(', ')}</p>}
      </section>}
    </div>
  );
}

function DomainCheckerNotice() {
  return <div className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200"><LockKeyhole className="h-4 w-4 shrink-0" />Lookup only uses public DNS and certificate details; private WHOIS information is not requested.</div>;
}

function ToolWorkspace({ tool }: { tool: SeoToolPage }) {
  let workspace: React.ReactNode;
  switch (tool.operation) {
    case 'url-audit':
      workspace = <UrlAuditTool tool={tool} />;
      break;
    case 'keyword-volume':
      workspace = <KeywordVolumeView />;
      break;
    case 'keyword-ideas':
      workspace = <KeywordIdeasTool />;
      break;
    case 'backlinks':
      workspace = <BacklinksView currentDomain="" />;
      break;
    case 'redirect':
      workspace = <RedirectCheckView />;
      break;
    case 'domain':
      workspace = <><DomainCheckerTool /><DomainCheckerNotice /></>;
      break;
    case 'schema':
      workspace = <SchemaCheckerTool />;
      break;
    case 'sitemap':
      workspace = <SitemapCheckerTool />;
      break;
    default:
      return null;
  }
  return <Suspense fallback={<div role="status" className="rounded-xl border border-white/10 bg-[#0D0D0D] p-5 text-sm text-neutral-400">Loading this SEO tool…</div>}>{workspace}</Suspense>;
}

function SeoToolsFooter() {
  return (
    <footer className="border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <a href="/" className="font-extrabold text-white">SEOX<span className="text-[#FF5E00]"> AI</span></a>
        <nav aria-label="Footer SEO tools" className="flex flex-wrap gap-x-5 gap-y-2 text-neutral-400">
          <a href="/" className="hover:text-white">Home</a>
          <a href={SEO_TOOLS_BASE} className="hover:text-white">Free SEO Tools</a>
          <a href={`${SEO_TOOLS_BASE}seo-checker/`} className="hover:text-white">SEO Checker</a>
          <a href={`${SEO_TOOLS_BASE}keyword-volume/`} className="hover:text-white">Keyword Volume</a>
          <a href="/entity-manager" className="hover:text-white">Entity Manager</a>
        </nav>
      </div>
    </footer>
  );
}

export const SeoToolsSite: React.FC<{ pathname: string }> = ({ pathname }) => {
  const isHub = pathname === SEO_TOOLS_BASE || pathname === '/seo-tools';
  const tool = useMemo(() => seoToolPages.find((item) => item.path === pathname || item.path.slice(0, -1) === pathname), [pathname]);
  useSeoMetadata(isHub ? SEO_TOOLS_BASE : tool?.path ?? pathname);

  if (!isHub && !tool) {
    return <div className="min-h-screen bg-[#080808] p-8 text-white"><a href={SEO_TOOLS_BASE} className="text-[#FF8A3D]">Return to SEO Tools</a><h1 className="mt-4 text-2xl font-bold">Tool not found</h1></div>;
  }

  const CurrentIcon = tool ? iconBySlug[tool.slug as keyof typeof iconBySlug] : Wrench;
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <ToolsHeader />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <a href="/" className="hover:text-white">Home</a><span aria-hidden="true">/</span>
          {isHub ? <span className="text-neutral-200">SEO Tools</span> : <><a href={SEO_TOOLS_BASE} className="hover:text-white">SEO Tools</a><span aria-hidden="true">/</span><span className="text-neutral-200">{tool?.name}</span></>}
        </nav>

        {isHub ? (
          <>
            <section className="max-w-3xl pb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF5E00]/25 bg-[#FF5E00]/10 px-3 py-1 text-xs font-semibold text-[#FF8A3D]"><Sparkles className="h-3.5 w-3.5" />Practical tools, live checks</div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Free SEO Tools</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300">Free SEO tools to analyze websites, keywords, backlinks, technical SEO and search performance.</p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">Run checks against a public URL or connect a supported data provider. Tools clearly identify estimates and unavailable data.</p>
            </section>
            <section aria-label="All free SEO tools" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {seoToolPages.map((item) => {
                const Icon = iconBySlug[item.slug as keyof typeof iconBySlug];
                return <article key={item.slug} className="group flex min-h-56 flex-col rounded-xl border border-white/[0.08] bg-[#0D0D0D] p-5 transition-colors hover:border-[#FF5E00]/30">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FF5E00]/20 bg-[#FF5E00]/10 text-[#FF8A3D]"><Icon className="h-5 w-5" /></span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">Free</span>
                  </div>
                  <h2 className="mt-5 text-lg font-bold text-white">{item.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-neutral-400">{item.description}</p>
                  <a href={item.path} className="mt-4 inline-flex min-h-11 items-center justify-between rounded-lg border border-white/10 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:border-[#FF5E00]/40 hover:text-white">
                    Open Tool <ArrowRight className="h-4 w-4 text-[#FF8A3D]" />
                  </a>
                  <span className="mt-2 truncate font-mono text-[11px] text-neutral-600">{item.path}</span>
                </article>;
              })}
            </section>
          </>
        ) : tool && (
          <>
            <section className="mb-7 max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FF5E00]/20 bg-[#FF5E00]/10 text-[#FF8A3D]"><CurrentIcon className="h-5 w-5" /></span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">Free tool</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{tool.title}</h1>
              <p className="mt-3 text-base leading-7 text-neutral-300">{tool.description}</p>
            </section>
            <section aria-label={`${tool.name} tool`} className="mb-10">
              <ToolWorkspace tool={tool} />
            </section>

            <article className="grid gap-8 border-t border-white/[0.08] py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="max-w-3xl space-y-8">
                <section><h2 className="text-xl font-bold">What is {tool.name}?</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{tool.what}</p></section>
                <section><h2 className="text-xl font-bold">How it works</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{tool.how}</p></section>
                <section><h2 className="text-xl font-bold">How to use this tool</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{tool.use}</p></section>
                <section><h2 className="text-xl font-bold">What the results mean</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{tool.meaning}</p></section>
                <section><h2 className="text-xl font-bold">Common ways to fix issues</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-300">{tool.fixes.map((fix) => <li key={fix} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#FF8A3D]" />{fix}</li>)}</ul></section>
                <section><h2 className="text-xl font-bold">Frequently asked questions</h2><div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">{tool.faqs.map((faq) => <details key={faq.question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">{faq.question}<CircleHelp className="h-4 w-4 shrink-0 text-[#FF8A3D]" /></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">{faq.answer}</p></details>)}</div></section>
              </div>
              <aside className="h-fit rounded-xl border border-white/[0.08] bg-[#0D0D0D] p-4">
                <h2 className="text-sm font-bold text-white">Related tools</h2>
                <nav aria-label="Related SEO tools" className="mt-3 grid gap-1">
                  {tool.related.map((slug) => {
                    const related = seoToolPages.find((item) => item.slug === slug);
                    return related ? <a key={slug} href={related.path} className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white">{related.name}<ArrowRight className="h-3.5 w-3.5 text-neutral-500" /></a> : null;
                  })}
                  {tool.slug === 'schema-checker' && <a href="/entity-manager" className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white">Entity Manager<ArrowRight className="h-3.5 w-3.5 text-neutral-500" /></a>}
                </nav>
              </aside>
            </article>
          </>
        )}
        <p className="mt-10 flex items-start gap-2 text-xs leading-5 text-neutral-500"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />Live checks describe the response available when you run them. Search estimates and third-party link indexes are not exact or complete measurements.</p>
      </main>
      <SeoToolsFooter />
    </div>
  );
};
