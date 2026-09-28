/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  RefreshCw,
  Filter,
  CheckCircle2,
  Layers,
  BarChart3,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Key,
  X,
  AlertCircle,
} from 'lucide-react';
import { Backlink, BacklinkMetrics, BacklinkRiskAssessment } from '../../../../server/providers/backlinkProvider';
import { useI18n } from '@/src/i18n';

interface BacklinksViewProps {
  currentDomain?: string;
}

export const BacklinksView: React.FC<BacklinksViewProps> = ({ currentDomain = 'https://yourwebsite.com' }) => {
  const { t, locale } = useI18n();
  const [domain, setDomain] = useState(
    currentDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  );
  const [selectedProvider, setSelectedProvider] = useState<'none' | 'dataforseo' | 'ahrefs' | 'semrush' | 'moz' | 'majestic'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [metrics, setMetrics] = useState<BacklinkMetrics | null>(null);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<BacklinkRiskAssessment | null>(null);

  // Filters
  const [followFilter, setFollowFilter] = useState<'all' | 'dofollow' | 'nofollow'>('all');
  const [searchAnchor, setSearchAnchor] = useState('');

  const availableProviders = [
    { id: 'none', name: locale === 'vi' ? 'Chưa chọn nhà cung cấp' : 'None (Unconfigured)' },
    { id: 'dataforseo', name: 'DataForSEO (Default)' },
    { id: 'ahrefs', name: 'Ahrefs API (unavailable)' },
    { id: 'semrush', name: 'Semrush API (unavailable)' },
    { id: 'moz', name: 'Moz Link Explorer (unavailable)' },
    { id: 'majestic', name: 'Majestic SEO (unavailable)' },
  ];

  const fetchBacklinkData = async (targetDom: string, provider: string) => {
    if (provider === 'none') {
      setIsConfigured(false);
      setProviderName(null);
      setMetrics(null);
      setBacklinks([]);
      setRiskAssessment(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/backlinks/overview?domain=${encodeURIComponent(targetDom)}&provider=${provider}`);
      if (!res.ok) throw new Error(`Backlink provider returned HTTP ${res.status}.`);
      const data = await res.json();

      setIsConfigured(Boolean(data.configured && data.status === 'configured'));
      setProviderName(typeof data.provider === 'string' ? data.provider : null);
      setMetrics(data.metrics || null);
      setBacklinks(data.backlinks || []);
      setRiskAssessment(data.riskAssessment || null);
    } catch {
      setIsConfigured(false);
      setProviderName(null);
      setMetrics(null);
      setBacklinks([]);
      setRiskAssessment(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklinkData(domain, selectedProvider);
  }, [domain, selectedProvider]);

  // Filtered backlink rows
  const filteredBacklinks = backlinks.filter((b) => {
    if (followFilter !== 'all' && b.isFollow === null) return false;
    if (followFilter === 'dofollow' && !b.isFollow) return false;
    if (followFilter === 'nofollow' && b.isFollow) return false;
    if (searchAnchor && !b.anchor.toLowerCase().includes(searchAnchor.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-semibold uppercase tracking-wider mb-2">
              <Link2 className="w-3.5 h-3.5" />
              {locale === 'vi' ? 'Kiến trúc Adapter Backlink Đa Nhà Cung Cấp' : 'Replaceable Backlink Provider Architecture'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {locale === 'vi' ? 'Phân tích Liên kết ngược & Đánh giá Rủi ro' : 'Backlink Intelligence & Risk Engine'}
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
              {locale === 'vi'
                ? 'Kiểm tra miền giới thiệu, phân bổ văn bản neo, dòng chảy dofollow và dấu hiệu thao túng liên kết mà không đánh giá sai các liên kết mới là độc hại.'
                : 'Inspect referring domains, anchor distribution, dofollow equity flow, and potential risk indicators without automatically mislabeling low-authority links as toxic.'}
            </p>
          </div>

          {/* Provider Selector & Connection State */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-neutral-400">
              {locale === 'vi' ? 'Bộ điều hợp đang kích hoạt' : 'Active Provider Adapter'}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#FF5E00]"
              >
                {availableProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <span
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 ${
                  isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isConfigured
                  ? (locale === 'vi' ? 'Đã kết nối' : 'Connected')
                  : (locale === 'vi' ? 'Chưa kết nối' : 'Not Connected')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UNCONFIGURED BACKLINK API STATE BANNER */}
      {!isConfigured && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{locale === 'vi' ? 'Chưa kết nối nguồn dữ liệu backlink' : 'Backlink data source not connected'}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-400">
                    {locale === 'vi' ? 'Tùy chọn' : 'Optional'}
                  </span>
                </h3>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  {locale === 'vi'
                    ? 'SEOX AI không tự sinh backlink giả. Hiện chỉ DataForSEO được tích hợp để cung cấp dữ liệu backlink trực tiếp.'
                    : 'SEOX AI does not generate simulated backlink records. DataForSEO is currently the only integrated live backlink provider.'}
                </p>
                <p className="mt-2 text-xs font-semibold text-amber-200">Backlink data unavailable - configure a supported provider.</p>
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

      {isConfigured && metrics && <p className="text-xs text-neutral-400">Data source: {providerName ?? selectedProvider}. Counts below describe records returned by this provider.</p>}

      {/* METRIC GAUGES */}
      {isConfigured && metrics && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
          <span className="text-xs uppercase font-medium text-neutral-400">
            {locale === 'vi' ? 'Bản ghi backlink trả về' : 'Backlink records returned'}
          </span>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {metrics.totalBacklinks.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            {locale === 'vi' ? 'Số bản ghi trong phản hồi API' : 'Records in the provider response'}
          </div>
        </div>

        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
          <span className="text-xs uppercase font-medium text-neutral-400">
            {locale === 'vi' ? 'Miền giới thiệu' : 'Referring Domains'}
          </span>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {metrics.referringDomains.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            {locale === 'vi' ? 'Tên miền duy nhất trong bản ghi trả về' : 'Unique domains among returned records'}
          </div>
        </div>

        <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-5">
          <span className="text-xs uppercase font-medium text-neutral-400">
            {locale === 'vi' ? 'Tỷ lệ Dofollow' : 'Dofollow vs Nofollow'}
          </span>
          <div className="text-3xl font-extrabold text-[#FF8A3D] mt-2 font-mono">
            {metrics.dofollowPercentage === null ? 'Not reported' : `${metrics.dofollowPercentage.toLocaleString()}%`}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            {metrics.dofollowCount === null || metrics.nofollowCount === null
              ? 'Follow attributes unavailable'
              : `${metrics.dofollowCount} dofollow / ${metrics.nofollowCount} nofollow among reported attributes`}
          </div>
        </div>
      </div>}

      {/* BACKLINK EXPLORER TABLE */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {locale === 'vi' ? 'Danh sách bản ghi Backlink' : 'Backlink Records'}
            </h3>
            <p className="text-xs text-neutral-400">
              {locale === 'vi'
                ? 'Thông tin chi tiết các trang liên kết nguồn, văn bản neo và thuộc tính liên kết.'
                : 'Detailed breakdown of linking source pages, anchor text, and link equity types.'}
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchAnchor}
              onChange={(e) => setSearchAnchor(e.target.value)}
              placeholder={locale === 'vi' ? 'Tìm theo anchor text...' : 'Search anchor text...'}
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5E00]"
            />

            <select
              value={followFilter}
              onChange={(e) => setFollowFilter(e.target.value as any)}
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
            >
              <option value="all">{locale === 'vi' ? 'Tất cả thuộc tính' : 'All Attributes'}</option>
              <option value="dofollow">Dofollow Only</option>
              <option value="nofollow">Nofollow Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider font-sans">
                <th className="pb-3 font-semibold">{locale === 'vi' ? 'Miền nguồn & URL' : 'Source Domain & URL'}</th>
                <th className="pb-3 font-semibold">Anchor Text</th>
                <th className="pb-3 font-semibold">{locale === 'vi' ? 'Loại' : 'Type'}</th>
                <th className="pb-3 font-semibold">Follow</th>
                <th className="pb-3 font-semibold text-right">{locale === 'vi' ? 'Hạng do nhà cung cấp báo cáo' : 'Provider-reported rank'}</th>
                <th className="pb-3 font-semibold text-right">{locale === 'vi' ? 'Phát hiện đầu' : 'First Seen'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredBacklinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 font-sans">
                    {isConfigured
                      ? (locale === 'vi' ? 'Không có backlink nào khớp với bộ lọc hiện tại.' : 'No backlinks matching current filters.')
                      : 'Backlink data unavailable - configure a supported provider.'}
                  </td>
                </tr>
              ) : (
                filteredBacklinks.map((link) => (
                  <tr key={link.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="font-sans font-medium text-white truncate max-w-[220px]">
                        {link.sourceDomain}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[220px]" title={link.sourceUrl}>
                        {link.sourceUrl}
                      </div>
                    </td>
                    <td className="py-3 font-sans text-neutral-200 truncate max-w-[180px]">
                      {link.anchor || <span className="text-neutral-500 italic">[Empty Anchor]</span>}
                    </td>
                    <td className="py-3 text-neutral-400 uppercase text-[11px]">
                      {link.linkType}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          link.isFollow
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {link.isFollow === null ? 'Not reported' : link.isFollow ? 'Dofollow' : 'Nofollow'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {link.providerRank === null ? <span className="text-neutral-500">Not reported</span> : <span className="font-bold text-[#FF8A3D]">{link.providerRank}</span>}
                    </td>
                    <td className="py-3 text-right text-neutral-400">
                      {link.firstSeen ? new Date(link.firstSeen).toLocaleDateString() : 'Not reported'}
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
                  {locale === 'vi' ? 'Kết nối Nhà Cung Cấp Backlink' : 'Connect Backlink Provider'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'vi' ? 'Hỗ trợ DataForSEO, Ahrefs, Semrush, Moz' : 'Supports DataForSEO, Ahrefs, Semrush, Moz'}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {locale === 'vi'
                ? 'Để kích hoạt phân tích backlink thực tế, hãy cấu hình một trong các nhà cung cấp sau trong tệp .env của máy chủ:'
                : 'To enable live backlink discovery, configure one of the supported provider credentials in your server .env file:'}
            </p>

            <div className="bg-[#0A0A0A] border border-white/[0.08] p-3.5 rounded-xl font-mono text-xs text-[#FF8A3D] space-y-1">
              <p className="text-neutral-500">// .env (DataForSEO Example)</p>
              <p>BACKLINK_PROVIDER="dataforseo"</p>
              <p>DATAFORSEO_LOGIN="your_login"</p>
              <p>DATAFORSEO_PASSWORD="your_password"</p>
            </div>

            <p className="text-[11px] text-neutral-500">
              {locale === 'vi'
                ? 'Nếu chưa cấu hình, ứng dụng vẫn hoạt động bình thường cho tất cả các tính năng SEO On-Page, kỹ thuật và kiểm tra nhanh.'
                : 'If unconfigured, all on-page, technical SEO, and quick audit capabilities remain 100% operational.'}
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
