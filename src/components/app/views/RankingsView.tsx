/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
  Key,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react';
import { useI18n } from '@/src/i18n';

interface RankingsViewProps {
  currentDomain?: string;
}

interface KeywordProject {
  projectId: string;
  projectName: string;
  domain: string;
  defaultCountry: string;
  defaultLanguage: string;
  defaultDevice: 'desktop' | 'mobile';
}

interface TrackedKeywordItem {
  id: string;
  projectId: string;
  domain: string;
  keyword: string;
  country: string;
  language: string;
  device: 'desktop' | 'mobile';
  position: number | null;
  previousPosition: number | null;
  rankingUrl: string | null;
  serpFeatures: string[];
  lastChecked: string;
}

interface StoredTrackedKeyword extends Record<string, unknown> {
  keyword: string;
}

interface OrganicSerpResult {
  position: number;
  title: string;
  url: string;
  isTargetDomain: boolean;
}

interface LatestSerpResult {
  configured: boolean;
  keyword: string;
  country: string;
  device: string;
  foundPosition: number | null;
  foundUrl: string | null;
  detectedSerpFeatures: string[];
  organicResults: OrganicSerpResult[];
  trackedAt: string;
  error?: string;
}

function isLatestSerpResult(value: unknown): value is LatestSerpResult {
  return isRecord(value)
    && typeof value.configured === 'boolean'
    && typeof value.keyword === 'string'
    && typeof value.country === 'string'
    && typeof value.device === 'string'
    && (value.foundPosition === null || typeof value.foundPosition === 'number')
    && (value.foundUrl === null || typeof value.foundUrl === 'string')
    && Array.isArray(value.detectedSerpFeatures)
    && value.detectedSerpFeatures.every((feature: unknown) => typeof feature === 'string')
    && Array.isArray(value.organicResults)
    && value.organicResults.every((result: unknown) => isRecord(result)
      && typeof result.position === 'number'
      && typeof result.title === 'string'
      && typeof result.url === 'string'
      && typeof result.isTargetDomain === 'boolean')
    && typeof value.trackedAt === 'string';
}

function normalizedDomain(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isKeywordProject(value: unknown): value is KeywordProject {
  return isRecord(value)
    && typeof value.projectId === 'string'
    && typeof value.projectName === 'string'
    && typeof value.domain === 'string'
    && typeof value.defaultCountry === 'string'
    && typeof value.defaultLanguage === 'string'
    && (value.defaultDevice === 'desktop' || value.defaultDevice === 'mobile');
}

function isStoredTrackedKeyword(value: unknown): value is StoredTrackedKeyword {
  return isRecord(value) && typeof value.keyword === 'string';
}

function loadProjects(currentDomain: string): KeywordProject[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('seox_keyword_projects') || '[]');
    if (Array.isArray(stored)) {
      const validProjects = stored.filter(isKeywordProject);
      if (validProjects.length > 0) return validProjects;
    }
  } catch {
    // Invalid local state is replaced with a usable default project.
  }
  return [{
    projectId: 'project_default',
    projectName: normalizedDomain(currentDomain) || 'SEOX Project',
    domain: normalizedDomain(currentDomain),
    defaultCountry: 'us',
    defaultLanguage: 'en',
    defaultDevice: 'desktop',
  }];
}

function loadTrackedKeywords(currentDomain: string, projects: KeywordProject[]): TrackedKeywordItem[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('seox_tracked_keywords') || '[]');
    if (!Array.isArray(stored)) return [];
    const defaultProject = projects[0];
    return stored.filter(isStoredTrackedKeyword).map((item) => {
      const projectId = typeof item.projectId === 'string' && projects.some((project) => project.projectId === item.projectId)
        ? item.projectId
        : defaultProject.projectId;
      const project = projects.find((candidate) => candidate.projectId === projectId) ?? defaultProject;
      const hadProjectModel = typeof item.projectId === 'string';
      return {
        id: typeof item.id === 'string' ? item.id : `kw_${crypto.randomUUID()}`,
        projectId,
        domain: typeof item.domain === 'string' ? item.domain : project.domain || normalizedDomain(currentDomain),
        keyword: item.keyword,
        country: typeof item.country === 'string' ? item.country : project.defaultCountry,
        language: typeof item.language === 'string' ? item.language : project.defaultLanguage,
        device: item.device === 'mobile' ? 'mobile' : 'desktop',
        position: typeof item.position === 'number' ? item.position : null,
        previousPosition: hadProjectModel && typeof item.previousPosition === 'number' ? item.previousPosition : null,
        rankingUrl: typeof item.rankingUrl === 'string' ? item.rankingUrl : null,
        serpFeatures: Array.isArray(item.serpFeatures) ? item.serpFeatures.filter((feature: unknown): feature is string => typeof feature === 'string') : [],
        lastChecked: typeof item.lastChecked === 'string' ? item.lastChecked : '',
      };
    });
  } catch {
    return [];
  }
}

export const RankingsView: React.FC<RankingsViewProps> = ({ currentDomain = 'https://yourwebsite.com' }) => {
  const { t, locale } = useI18n();
  const [projects, setProjects] = useState<KeywordProject[]>(() => loadProjects(currentDomain));
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const storedProjects = loadProjects(currentDomain);
    const savedId = localStorage.getItem('seox_active_keyword_project');
    return savedId && storedProjects.some((project) => project.projectId === savedId)
      ? savedId
      : storedProjects[0].projectId;
  });
  const activeProject = projects.find((project) => project.projectId === activeProjectId) ?? projects[0];
  const [keywordInput, setKeywordInput] = useState('');
  const [country, setCountry] = useState(() => loadProjects(currentDomain)[0].defaultCountry);
  const [language, setLanguage] = useState(() => loadProjects(currentDomain)[0].defaultLanguage);
  const [device, setDevice] = useState<'desktop' | 'mobile'>(() => loadProjects(currentDomain)[0].defaultDevice);
  const [targetDomain, setTargetDomain] = useState(
    normalizedDomain(currentDomain)
  );
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [projectDomainInput, setProjectDomainInput] = useState(normalizedDomain(currentDomain));

  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [trackedKeywords, setTrackedKeywords] = useState<TrackedKeywordItem[]>(() =>
    loadTrackedKeywords(currentDomain, loadProjects(currentDomain))
  );
  const projectKeywords = trackedKeywords.filter((item) => item.projectId === activeProjectId);

  const [latestSerpDetails, setLatestSerpDetails] = useState<LatestSerpResult | null>(null);

  useEffect(() => {
    // Check integration status
    fetch('/api/integrations/status')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load SERP provider status.');
        const data: unknown = await response.json();
        const provider = isRecord(data) ? data.serpProvider : null;
        setApiConfigured(isRecord(provider) && typeof provider.configured === 'boolean' ? provider.configured : false);
      })
      .catch(() => setApiConfigured(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('seox_keyword_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('seox_tracked_keywords', JSON.stringify(trackedKeywords));
  }, [trackedKeywords]);

  useEffect(() => {
    localStorage.setItem('seox_active_keyword_project', activeProjectId);
  }, [activeProjectId]);

  const handleSelectProject = (projectId: string) => {
    const project = projects.find((item) => item.projectId === projectId);
    if (!project) return;
    setActiveProjectId(projectId);
    setTargetDomain(project.domain);
    setCountry(project.defaultCountry);
    setLanguage(project.defaultLanguage);
    setDevice(project.defaultDevice);
  };

  const updateProjectDefaults = (updates: Partial<KeywordProject>) => {
    setProjects((existing) => existing.map((project) =>
      project.projectId === activeProjectId ? { ...project, ...updates } : project
    ));
  };

  const handleCreateProject = (event: React.FormEvent) => {
    event.preventDefault();
    const domain = normalizedDomain(projectDomainInput);
    if (!projectNameInput.trim() || !domain) return;
    const project: KeywordProject = {
      projectId: crypto.randomUUID(),
      projectName: projectNameInput.trim(),
      domain,
      defaultCountry: country,
      defaultLanguage: language,
      defaultDevice: device,
    };
    setProjects((existing) => [...existing, project]);
    setActiveProjectId(project.projectId);
    setTargetDomain(domain);
    setProjectNameInput('');
    setShowProjectForm(false);
  };

  const handleTrackKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    setIsLoading(true);
    setApiError(null);
    setLatestSerpDetails(null);

    try {
      const res = await fetch('/api/rankings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keywordInput.trim(),
          country,
          language,
          device,
          targetDomain,
        }),
      });

      const data: unknown = await res.json();
      if (!isLatestSerpResult(data)) throw new Error('SERP provider returned an invalid response.');

      if (!data.configured) {
        setApiConfigured(false);
        setApiError(data.error || 'SERP API Provider is not configured.');
        return;
      }

      setApiConfigured(true);
      setLatestSerpDetails(data);

      // Upsert into tracked keywords
      const previousEntry = trackedKeywords.find((item) =>
        item.projectId === activeProjectId
        && item.domain.toLowerCase() === normalizedDomain(targetDomain).toLowerCase()
        && item.keyword.toLocaleLowerCase() === keywordInput.trim().toLocaleLowerCase()
        && item.country === country && item.language === language && item.device === device
      );
      const newEntry: TrackedKeywordItem = {
        id: previousEntry?.id ?? `kw_${crypto.randomUUID()}`,
        projectId: activeProjectId,
        domain: normalizedDomain(targetDomain),
        keyword: keywordInput.trim(),
        country,
        language,
        device,
        position: typeof data.foundPosition === 'number' ? data.foundPosition : null,
        previousPosition: previousEntry?.position ?? null,
        rankingUrl: data.foundUrl,
        serpFeatures: data.detectedSerpFeatures || [],
        lastChecked: typeof data.trackedAt === 'string' ? data.trackedAt : new Date().toISOString(),
      };

      const updated = [newEntry, ...trackedKeywords.filter((item) => item.id !== newEntry.id)];
      setTrackedKeywords(updated);
      localStorage.setItem('seox_tracked_keywords', JSON.stringify(updated));
      setKeywordInput('');
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : 'Failed to query SERP tracker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKeyword = (id: string) => {
    const updated = trackedKeywords.filter((k) => k.id !== id);
    setTrackedKeywords(updated);
    localStorage.setItem('seox_tracked_keywords', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold uppercase tracking-wider mb-2">
              <Search className="w-3.5 h-3.5" />
              Live SERP Rank Tracking
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Keyword Intelligence & SERP Positions</h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Track live organic ranking positions, SERP features (Featured Snippets, PAA, Local Packs), and SERP movement. SEOX AI relies solely on live provider requests and refuses to synthesize fake positions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                apiConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${apiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {apiConfigured
                ? (locale === 'vi' ? 'SERP: Đã kết nối (Trực tiếp)' : 'SERP: Connected (Live)')
                : 'SERP API chưa kết nối'}
            </span>
          </div>
        </div>
      </div>

      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5" htmlFor="keyword-project">
              Project
            </label>
            <select
              id="keyword-project"
              value={activeProjectId}
              onChange={(event) => handleSelectProject(event.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            >
              {projects.map((project) => (
                <option value={project.projectId} key={project.projectId}>
                  {project.projectName} — {project.domain}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowProjectForm((visible) => !visible)}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:border-[#FF5E00]/50 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1.5" />Create project
          </button>
          <div className="text-xs text-neutral-500 sm:pb-2">
            {activeProject.defaultCountry.toUpperCase()} · {activeProject.defaultLanguage} · {activeProject.defaultDevice}
          </div>
        </div>
        {showProjectForm && (
          <form onSubmit={handleCreateProject} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mt-4 pt-4 border-t border-white/[0.08]">
            <input
              value={projectNameInput}
              onChange={(event) => setProjectNameInput(event.target.value)}
              placeholder="Project name"
              aria-label="Project name"
              required
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
            />
            <input
              value={projectDomainInput}
              onChange={(event) => setProjectDomainInput(event.target.value)}
              placeholder="example.com"
              aria-label="Project domain"
              required
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#FF5E00]"
            />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white text-sm font-semibold">
              Save project
            </button>
          </form>
        )}
      </div>

      {/* TRACKING INPUT BAR */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
          <span>Track New Keyword</span>
        </h3>

        <form onSubmit={handleTrackKeyword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword Input */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Keyword / Search Query
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="e.g. technical seo audit checklist"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
                />
              </div>
            </div>

            {/* Target Domain */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Target Domain
              </label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => {
                  setTargetDomain(e.target.value);
                  updateProjectDefaults({ domain: normalizedDomain(e.target.value) });
                }}
                placeholder="yourwebsite.com"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  updateProjectDefaults({ defaultCountry: e.target.value });
                }}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              >
                <option value="us">United States (US)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="de">Germany (DE)</option>
                <option value="fr">France (FR)</option>
                <option value="ca">Canada (CA)</option>
                <option value="au">Australia (AU)</option>
                <option value="jp">Japan (JP)</option>
                <option value="br">Brazil (BR)</option>
                <option value="vn">Vietnam (VN)</option>
                <option value="th">Thailand (TH)</option>
                <option value="id">Indonesia (ID)</option>
                <option value="my">Malaysia (MY)</option>
                <option value="sg">Singapore (SG)</option>
                <option value="ph">Philippines (PH)</option>
                <option value="kh">Cambodia (KH)</option>
                <option value="la">Laos (LA)</option>
                <option value="mm">Myanmar (MM)</option>
                <option value="bn">Brunei (BN)</option>
                <option value="tl">Timor-Leste (TL)</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  updateProjectDefaults({ defaultLanguage: e.target.value });
                }}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              >
                <option value="en">English (EN)</option>
                <option value="vi">Vietnamese (VI)</option>
                <option value="th">Thai (TH)</option>
                <option value="id">Indonesian (ID)</option>
                <option value="ms">Malay (MS)</option>
              </select>
            </div>

            {/* Device Toggle */}
            <div className="md:col-span-2 flex flex-col justify-end">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Device
              </label>
              <div className="bg-[#121212] border border-white/10 rounded-xl p-1 flex">
                <button
                  type="button"
                  onClick={() => {
                    setDevice('desktop');
                    updateProjectDefaults({ defaultDevice: 'desktop' });
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    device === 'desktop' ? 'bg-[#FF5E00] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDevice('mobile');
                    updateProjectDefaults({ defaultDevice: 'mobile' });
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    device === 'mobile' ? 'bg-[#FF5E00] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-500">
              Performs real-time SERP parsing with location-specific IP proxying.
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(255,94,0,0.3)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Querying Live SERP...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Track Live Position
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* UNCONFIGURED SERP API STATE: Explicit requirement in prompt */}
      {apiConfigured === false && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Key className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>SERP API chưa kết nối</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-400">
                    {locale === 'vi' ? 'Tùy chọn' : 'Optional'}
                  </span>
                </h3>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  {locale === 'vi'
                    ? 'SEOX AI không tự sinh thứ hạng từ khóa giả lập. Để kích hoạt theo dõi vị trí từ khóa theo thời gian thực trên Google Search, vui lòng kết nối API.'
                    : 'SEOX AI uses real SERP providers (SerpApi, DataForSEO) to capture factual rankings and strictly refuses to fabricate fake positions.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6D1A] transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-md shadow-[#FF5E00]/20"
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span>{locale === 'vi' ? 'Kết nối API' : 'Connect API'}</span>
            </button>
          </div>
        </div>
      )}

      {/* RECENT SERP INSPECTION HIGHLIGHT */}
      {latestSerpDetails && (
        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase text-neutral-400">Live SERP Result</span>
              <h4 className="text-lg font-bold text-white mt-0.5">"{latestSerpDetails.keyword}"</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400 font-mono">
                {latestSerpDetails.country.toUpperCase()} • {latestSerpDetails.device}
              </span>
              <div className="text-base font-bold text-[#FF8A3D] font-mono mt-0.5">
                {latestSerpDetails.foundPosition ? `Position #${latestSerpDetails.foundPosition}` : 'Not in Top 20'}
              </div>
            </div>
          </div>

          {/* SERP Features Detected */}
          {latestSerpDetails.detectedSerpFeatures?.length > 0 && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-400">SERP Features:</span>
              {latestSerpDetails.detectedSerpFeatures.map((feat: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF8A3D]"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}

          {/* Top 5 Organic Results in SERP */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold text-neutral-400">Top Competitors in SERP</span>
            <div className="divide-y divide-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden bg-[#121212]">
              {latestSerpDetails.organicResults.slice(0, 5).map((org, i) => (
                <div
                  key={i}
                  className={`p-3 flex items-start justify-between gap-4 text-xs ${
                    org.isTargetDomain ? 'bg-[#FF5E00]/10 border-l-2 border-[#FF5E00]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono font-bold text-neutral-400 w-6">#{org.position}</span>
                    <div>
                      <div className="font-semibold text-white truncate max-w-md">{org.title}</div>
                      <div className="text-neutral-400 font-mono text-[11px] truncate max-w-md mt-0.5">
                        {org.url}
                      </div>
                    </div>
                  </div>
                  {org.isTargetDomain && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5E00] text-white">
                      Your Domain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRACKED KEYWORDS TABLE */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Tracked Keyword Portfolio</h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              Active ranking radar monitoring search engine results pages.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {projectKeywords.length} keywords in {activeProject.projectName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                <th className="pb-3 font-semibold">Keyword</th>
                <th className="pb-3 font-semibold">Domain</th>
                <th className="pb-3 font-semibold">Location / Device</th>
                <th className="pb-3 font-semibold text-right">Position</th>
                <th className="pb-3 font-semibold text-right">Previous</th>
                <th className="pb-3 font-semibold text-right">Change</th>
                <th className="pb-3 font-semibold">SERP Features</th>
                <th className="pb-3 font-semibold">Last checked</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projectKeywords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500 font-sans">
                    No keywords in this project yet. Enter a query above to start monitoring.
                  </td>
                </tr>
              ) : (
                projectKeywords.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-sans text-white font-medium">
                      <div>{item.keyword}</div>
                    </td>
                    <td className="py-3 font-mono text-neutral-400 max-w-[180px] truncate" title={item.domain}>{item.domain}</td>
                    <td className="py-3 text-neutral-300">
                      {item.country.toUpperCase()} • {item.device}
                    </td>
                    <td className="py-3 text-right">
                      {item.position !== null ? (
                        <span className="font-bold text-[#FF8A3D] text-sm">#{item.position}</span>
                      ) : (
                        <span className="text-neutral-500">Not found</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-neutral-400">
                      {item.previousPosition === null ? '—' : `#${item.previousPosition}`}
                    </td>
                    <td className="py-3 text-right">
                      {item.previousPosition && item.position ? (
                        item.previousPosition > item.position ? (
                          <span className="text-emerald-400 flex items-center justify-end gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />+{item.previousPosition - item.position}
                          </span>
                        ) : item.previousPosition < item.position ? (
                          <span className="text-rose-400 flex items-center justify-end gap-0.5">
                            <TrendingDown className="w-3.5 h-3.5" />-{item.position - item.previousPosition}
                          </span>
                        ) : (
                          <span className="text-neutral-500 flex items-center justify-end gap-0.5">
                            <Minus className="w-3 h-3" />0
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="py-3 font-sans">
                      {item.rankingUrl && (
                        <a href={item.rankingUrl} target="_blank" rel="noreferrer" className="block text-[11px] text-neutral-400 underline decoration-white/20 hover:text-[#FF8A3D] truncate max-w-[220px] mb-1" title={item.rankingUrl}>
                          {item.rankingUrl}
                        </a>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.serpFeatures.length === 0 ? (
                          <span className="text-neutral-500 text-[11px]">None detected</span>
                        ) : (
                          item.serpFeatures.slice(0, 2).map((feat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] border border-white/10 text-neutral-300"
                            >
                              {feat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-neutral-400 whitespace-nowrap">
                      {item.lastChecked ? new Date(item.lastChecked).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveKeyword(item.id)}
                        className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Remove keyword"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141414] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {locale === 'vi' ? 'Kết nối SERP API' : 'Connect SERP API'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'vi' ? 'Hỗ trợ SerpApi hoặc DataForSEO' : 'Supports SerpApi or DataForSEO'}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {locale === 'vi'
                ? 'Để kích hoạt theo dõi vị trí từ khóa thời gian thực, hãy cấu hình SERP_API_KEY trong tệp .env của máy chủ:'
                : 'To enable real-time SERP keyword tracking, configure SERP_API_KEY in your server .env file:'}
            </p>

            <div className="bg-[#0A0A0A] border border-white/[0.08] p-3.5 rounded-xl font-mono text-xs text-[#FF8A3D] space-y-1">
              <p className="text-neutral-500">// .env</p>
              <p>SERP_API_KEY="your_serpapi_key_here"</p>
            </div>

            <p className="text-[11px] text-neutral-500">
              {locale === 'vi'
                ? 'Không bắt buộc để sử dụng ứng dụng. Quick SEO Audit và Technical SEO vẫn hoạt động độc lập.'
                : 'Not required for core app operation. Quick SEO Audit and Technical SEO remain fully operational.'}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {locale === 'vi' ? 'Đã hiểu' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
