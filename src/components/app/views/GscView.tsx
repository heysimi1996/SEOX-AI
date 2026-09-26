/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  FileSearch,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import { useI18n } from '@/src/i18n';

interface GscViewProps {
  currentDomain?: string;
}

export const GscView: React.FC<GscViewProps> = ({ currentDomain = 'https://yourwebsite.com' }) => {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'performance' | 'opportunities' | 'inspect'>('performance');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // GSC OAuth Token
  const [accessToken, setAccessToken] = useState<string>('');
  const [sites, setSites] = useState<Array<{ siteUrl: string; permissionLevel: string }>>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'7d' | '28d' | '90d'>('28d');

  // Performance Data
  const [performanceData, setPerformanceData] = useState<any | null>(null);

  // URL Inspection Data
  const [inspectUrl, setInspectUrl] = useState<string>(currentDomain);
  const [inspectionResult, setInspectionResult] = useState<any | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem('seox_gsc_token');
    if (saved) {
      setAccessToken(saved);
      fetchSites(saved);
    }
  }, []);

  const fetchSites = async (token: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/gsc/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch Search Console properties');
      }

      setSites(data.sites || []);
      setIsConnected(true);
      localStorage.setItem('seox_gsc_token', token);

      if (data.sites && data.sites.length > 0) {
        const matching = data.sites.find((s: any) =>
          s.siteUrl.toLowerCase().includes(currentDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase())
        );
        const chosen = matching ? matching.siteUrl : data.sites[0].siteUrl;
        setSelectedSite(chosen);
        fetchAnalytics(token, chosen, timeframe);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authorization error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async (token: string, siteUrl: string, tf: '7d' | '28d' | '90d') => {
    if (!siteUrl || !token) return;
    setIsLoading(true);
    try {
      const days = tf === '7d' ? 7 : tf === '90d' ? 90 : 28;
      const now = new Date();
      const end = now.toISOString().split('T')[0];
      const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch('/api/gsc/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token,
          siteUrl,
          startDate: start,
          endDate: end,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load search analytics');
      }
      setPerformanceData(data);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to query analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) {
      setAuthError('Please provide a valid Google Search Console access token.');
      return;
    }
    fetchSites(accessToken.trim());
  };

  const handleDisconnect = () => {
    localStorage.removeItem('seox_gsc_token');
    setAccessToken('');
    setIsConnected(false);
    setSites([]);
    setPerformanceData(null);
    setInspectionResult(null);
  };

  const handleRunInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectUrl) return;
    setIsInspecting(true);
    setInspectError(null);
    setInspectionResult(null);

    try {
      const res = await fetch('/api/gsc/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          siteUrl: selectedSite,
          inspectionUrl: inspectUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Inspection failed');
      }
      setInspectionResult(json.data);
    } catch (err: any) {
      setInspectError(err.message || 'Failed to inspect URL with Google API');
    } finally {
      setIsInspecting(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Not Connected State (Zero Fabricated Data Discipline)
  // -------------------------------------------------------------
  if (!isConnected) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5E00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5" />
                {locale === 'vi' ? 'Dữ liệu đo kiểm Google xác thực' : 'Verified Google Telemetry'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {locale === 'vi' ? 'Chưa kết nối Search Console' : 'Google Search Console Integration'}
              </h2>
              <p className="text-neutral-400 text-sm mt-2 max-w-2xl leading-relaxed">
                {locale === 'vi'
                  ? 'Kết nối thuộc tính Google Search Console đã xác minh để xem lượt nhấp, số lần hiển thị, CTR, từ khóa và trạng thái lập chỉ mục URL thực tế.'
                  : 'Connect your verified Google Search Console property to inspect real-time click volume, impressions, CTR, keyword queries, and Google URL inspection index state.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {locale === 'vi' ? 'Chưa kết nối' : 'Not Connected'}
              </span>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Scope: <code className="text-[#FF8A3D]">webmasters.readonly</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Form Card */}
        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 sm:p-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {locale === 'vi' ? 'Kết nối Thuộc tính Search Console' : 'Connect Your Search Console Property'}
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              {locale === 'vi'
                ? 'SEOX AI bắt buộc sử dụng ủy quyền OAuth thực tế và từ chối tạo số liệu giả lập. Kết nối bằng Google OAuth Bearer Token của bạn.'
                : 'SEOX AI strictly requires OAuth authorization and never generates simulated or fake Search Console numbers. Connect using your Google OAuth Bearer Token.'}
            </p>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-semibold">{locale === 'vi' ? 'Lỗi xác thực' : 'Authorization Error'}</p>
                  <p className="text-xs text-rose-300/80 mt-1">{authError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleConnectToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Google OAuth Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00] font-mono"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {locale === 'vi'
                    ? 'Yêu cầu quyền đọc: '
                    : 'Token requires read-only access to '}<code className="text-neutral-400">https://www.googleapis.com/auth/webmasters.readonly</code>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(255,94,0,0.3)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {locale === 'vi' ? 'Đang xác thực với Google...' : 'Authenticating with Google...'}
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      {locale === 'vi' ? 'Kết nối API & Tải dữ liệu GSC' : 'Authorize & Load GSC Properties'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Privacy & Guarantee note */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-start gap-3 text-xs text-neutral-400">
              <Info className="w-4 h-4 text-[#FF5E00] shrink-0 mt-0.5" />
              <span>
                <strong>Integrity Policy:</strong> In compliance with the platform standard, Search Performance and URL Inspection remain disabled until authenticated. No synthetic or generated data will be displayed.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Connected GSC Dashboard
  // -------------------------------------------------------------
  const summary = performanceData?.summary || {
    totalClicks: 0,
    totalImpressions: 0,
    avgCtr: 0,
    avgPosition: 0,
  };

  const opportunities = performanceData?.opportunities || {
    highImpressionsLowCtr: [],
    strikingDistance: [],
    decliningQueries: [],
    decliningPages: [],
  };

  return (
    <div className="space-y-6">
      {/* Property Bar & Status */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
                Google Search Console Connected
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedSite}
                onChange={(e) => {
                  setSelectedSite(e.target.value);
                  fetchAnalytics(accessToken, e.target.value, timeframe);
                }}
                className="bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              >
                {sites.map((s) => (
                  <option key={s.siteUrl} value={s.siteUrl}>
                    {s.siteUrl} ({s.permissionLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeframe & Disconnect */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="bg-[#121212] border border-white/10 rounded-xl p-1 flex items-center text-xs">
            {(['7d', '28d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  fetchAnalytics(accessToken, selectedSite, tf);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeframe === tf ? 'bg-[#FF5E00] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf === '7d' ? 'Last 7 Days' : tf === '28d' ? 'Last 28 Days' : 'Last 3 Months'}
              </button>
            ))}
          </div>

          <button
            onClick={handleDisconnect}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/[0.08] gap-6 text-sm">
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'performance' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Search Performance
          {activeTab === 'performance' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'opportunities' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Growth Opportunities
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#FF5E00]/20 text-[#FF5E00]">
            {(opportunities.highImpressionsLowCtr.length + opportunities.strikingDistance.length)}
          </span>
          {activeTab === 'opportunities' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inspect')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'inspect' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Google URL Inspection
          {activeTab === 'inspect' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5E00]" />
          )}
        </button>
      </div>

      {/* TAB 1: SEARCH PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Total Organic Clicks</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {summary.totalClicks.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <span>Verified Google search clicks</span>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Total Impressions</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {summary.totalImpressions.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <span>SERP appearances</span>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Average CTR</span>
              <div className="text-3xl font-extrabold text-[#FF8A3D] mt-2 font-mono">
                {summary.avgCtr}%
              </div>
              <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <span>Click-through rate</span>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <span className="text-xs uppercase font-medium text-neutral-400">Average Position</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                #{summary.avgPosition}
              </div>
              <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <span>Across all ranking terms</span>
              </div>
            </div>
          </div>

          {/* Queries & Pages Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Queries */}
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <h3 className="font-bold text-white text-base mb-4 flex items-center justify-between">
                <span>Top Queries</span>
                <span className="text-xs font-mono text-neutral-400">
                  {performanceData?.queries?.length || 0} discovered
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Query</th>
                      <th className="pb-3 font-semibold text-right">Clicks</th>
                      <th className="pb-3 font-semibold text-right">Impr.</th>
                      <th className="pb-3 font-semibold text-right">CTR</th>
                      <th className="pb-3 font-semibold text-right">Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    {(performanceData?.queries || []).slice(0, 10).map((q: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-sans text-neutral-200 truncate max-w-[160px] font-medium">
                          {q.query}
                        </td>
                        <td className="py-2.5 text-right text-emerald-400">{q.clicks}</td>
                        <td className="py-2.5 text-right text-neutral-400">{q.impressions}</td>
                        <td className="py-2.5 text-right text-neutral-300">{q.ctr}%</td>
                        <td className="py-2.5 text-right text-[#FF8A3D]">#{q.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Pages */}
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
              <h3 className="font-bold text-white text-base mb-4 flex items-center justify-between">
                <span>Top Pages</span>
                <span className="text-xs font-mono text-neutral-400">
                  {performanceData?.pages?.length || 0} indexed
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Page URL</th>
                      <th className="pb-3 font-semibold text-right">Clicks</th>
                      <th className="pb-3 font-semibold text-right">Impr.</th>
                      <th className="pb-3 font-semibold text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    {(performanceData?.pages || []).slice(0, 10).map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 text-neutral-200 truncate max-w-[200px]" title={p.page}>
                          {p.page.replace(/^https?:\/\/[^/]+/i, '') || '/'}
                        </td>
                        <td className="py-2.5 text-right text-emerald-400">{p.clicks}</td>
                        <td className="py-2.5 text-right text-neutral-400">{p.impressions}</td>
                        <td className="py-2.5 text-right text-neutral-300">{p.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROWTH OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          {/* Opportunity 1: High Impressions / Low CTR */}
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  CTR Optimization Opportunity
                </span>
                <h3 className="text-lg font-bold text-white">High Impressions / Low CTR Queries</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Google is ranking your pages for these terms, but users are scrolling past without clicking. Rewrite your title tags and meta descriptions to improve CTR.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold font-sans">Query</th>
                    <th className="pb-3 font-semibold text-right">Impressions</th>
                    <th className="pb-3 font-semibold text-right">Current CTR</th>
                    <th className="pb-3 font-semibold text-right">Avg Position</th>
                    <th className="pb-3 font-semibold font-sans">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {opportunities.highImpressionsLowCtr.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500 font-sans">
                        No acute CTR bottlenecks detected in current timeframe.
                      </td>
                    </tr>
                  ) : (
                    opportunities.highImpressionsLowCtr.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-sans text-white font-medium">{item.query}</td>
                        <td className="py-3 text-right text-neutral-300">{item.impressions.toLocaleString()}</td>
                        <td className="py-3 text-right text-rose-400 font-semibold">{item.ctr}%</td>
                        <td className="py-3 text-right text-[#FF8A3D]">#{item.position}</td>
                        <td className="py-3 font-sans text-neutral-400">
                          Add query hook to &lt;title&gt; and include clear value proposition.
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Opportunity 2: Striking Distance (Position 4 - 15) */}
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Striking Distance Keywords (Positions 4–15)
                </span>
                <h3 className="text-lg font-bold text-white">Quick-Win Ranking Targets</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Queries on the cusp of the Top 3 or bottom of Page 1. Enhancing internal links and adding semantic subheadings can push these into the top 3 spots.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold font-sans">Query</th>
                    <th className="pb-3 font-semibold text-right">Position</th>
                    <th className="pb-3 font-semibold text-right">Impressions</th>
                    <th className="pb-3 font-semibold text-right">Clicks</th>
                    <th className="pb-3 font-semibold font-sans">Opportunity Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {opportunities.strikingDistance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500 font-sans">
                        No keywords currently in the 4–15 striking bracket.
                      </td>
                    </tr>
                  ) : (
                    opportunities.strikingDistance.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-sans text-white font-medium">{item.query}</td>
                        <td className="py-3 text-right text-[#FF8A3D] font-bold">#{item.position}</td>
                        <td className="py-3 text-right text-neutral-300">{item.impressions.toLocaleString()}</td>
                        <td className="py-3 text-right text-emerald-400">{item.clicks}</td>
                        <td className="py-3 font-sans text-neutral-400">
                          High leverage target: Add 2-3 contextual internal links pointing to destination page.
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE URL INSPECTION API */}
      {activeTab === 'inspect' && (
        <div className="space-y-6">
          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Live Google URL Inspection</h3>
            <p className="text-neutral-400 text-xs mb-6 max-w-2xl">
              Inspect any URL on this verified property directly against Google’s Indexing infrastructure. Live coverage, crawl status, canonical confirmation, and mobile usability.
            </p>

            <form onSubmit={handleRunInspection} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={inspectUrl}
                onChange={(e) => setInspectUrl(e.target.value)}
                placeholder="https://yourdomain.com/path"
                required
                className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00] font-mono"
              />
              <button
                type="submit"
                disabled={isInspecting}
                className="px-6 py-3 rounded-xl bg-[#FF5E00] hover:bg-[#FF6A1A] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(255,94,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isInspecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying Google API...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4" />
                    Inspect URL
                  </>
                )}
              </button>
            </form>

            {inspectError && (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {inspectError}
              </div>
            )}
          </div>

          {/* Inspection Results Card */}
          {inspectionResult && (
            <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-xs uppercase text-neutral-400 font-medium">Inspected Destination</span>
                  <div className="text-sm font-mono text-white mt-1 break-all">{inspectionResult.inspectionUrl}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase text-neutral-400 font-medium">Last Crawled By Google</span>
                  <div className="text-sm font-mono text-neutral-200 mt-1">
                    {inspectionResult.lastCrawl?.status === 'Available'
                      ? new Date(inspectionResult.lastCrawl.timestamp).toLocaleString()
                      : 'Unavailable'}
                  </div>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Index Status */}
                <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Index Coverage Status
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        inspectionResult.indexStatus.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {inspectionResult.indexStatus.status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {inspectionResult.indexStatus.value}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Google verdict: {inspectionResult.indexStatus.verdict}
                  </p>
                </div>

                {/* 2. Crawl Status */}
                <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Crawl & Fetch State
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        inspectionResult.crawlStatus.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {inspectionResult.crawlStatus.status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {inspectionResult.crawlStatus.crawledAs}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Robots directive: {inspectionResult.crawlStatus.robotsTxtState} | Indexing:{' '}
                    {inspectionResult.crawlStatus.indexingState}
                  </p>
                </div>

                {/* 3. Canonical Tags */}
                <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Canonical Comparison
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        inspectionResult.canonical.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {inspectionResult.canonical.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="text-neutral-400">
                      User-Declared: <span className="text-white">{inspectionResult.canonical.userCanonical}</span>
                    </div>
                    <div className="text-neutral-400">
                      Google-Selected:{' '}
                      <span className="text-[#FF8A3D]">{inspectionResult.canonical.googleCanonical}</span>
                    </div>
                  </div>
                  {inspectionResult.canonical.matches !== null && (
                    <p className="text-xs mt-2 font-medium">
                      {inspectionResult.canonical.matches ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Canonical matches Google evaluation
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Google chose a different canonical than user declared
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* 4. Mobile Usability */}
                <div className="border border-white/[0.08] bg-[#121212] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Mobile Usability
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        inspectionResult.mobileUsability.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {inspectionResult.mobileUsability.status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white">
                    Verdict: {inspectionResult.mobileUsability.verdict}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {inspectionResult.mobileUsability.issues.length === 0
                      ? 'No mobile-friendliness issues reported by Google.'
                      : `Issues: ${inspectionResult.mobileUsability.issues.join(', ')}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
