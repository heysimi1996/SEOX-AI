import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Activity,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore, CategoryScore } from '@/src/rules/types';
import { useI18n } from '@/src/i18n';

interface OverviewViewProps {
  pageData: PageAuditData;
  evaluations: RuleEvaluationResult[];
  healthScore: OverallHealthScore;
  onNavigate: (viewId: string) => void;
  onOpenFix: (ruleId: string, ruleName: string, category: string, snippet?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  pageData,
  evaluations,
  healthScore,
  onNavigate,
  onOpenFix,
}) => {
  const { t, locale, formatNumber } = useI18n();
  const failedEvaluations = evaluations.filter((e) => !e.passed);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: SEO Health Score */}
      <div className="rounded-3xl bg-gradient-to-br from-[#161616] via-[#111111] to-[#0A0A0A] border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5E00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-[#FF8A3D] uppercase">
                {locale === 'vi' ? 'Đo kiểm chẩn đoán' : 'Diagnostic Benchmark'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.06]">
                {t('common.live').toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              {locale === 'vi' ? 'TỔNG QUAN SỨC KHỎE SEO' : 'SEO HEALTH SCORE'}
            </h1>

            {/* Mandatory SEO Health Score Disclaimer */}
            <p className="text-xs text-neutral-300 mt-2 max-w-xl font-medium bg-[#0A0A0A] border border-white/[0.08] p-2.5 rounded-xl">
              {locale === 'vi'
                ? 'Đây là điểm sức khỏe SEO do SEOX AI tính toán và không đại diện cho điểm xếp hạng của Google.'
                : "This is an SEO Health Score calculated by SEOX AI and does not represent Google's ranking score."}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#0A0A0A]/80 p-5 rounded-2xl border border-white/[0.08]">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black font-mono text-white tabular-nums">
                  {healthScore.score}
                </span>
                <span className="text-xl font-medium font-mono text-neutral-500">/ 100</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {t('dashboard.increasedPoints', { points: healthScore.trend })}{' '}
                  {t('dashboard.comparedToPrevious')}
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-12 w-[1px] bg-white/[0.1]" />

            <div className="hidden sm:flex flex-col text-xs text-neutral-400 space-y-1">
              <span>{t('dashboard.targetUrl')}: <strong className="text-white font-mono">{pageData.url.slice(0, 24)}...</strong></span>
              <span>{locale === 'vi' ? 'Phân tích' : 'Scanned'}: <strong className="text-white font-mono">1 URL</strong></span>
              <span>{locale === 'vi' ? 'Độ trễ' : 'Latency'}: <strong className="text-emerald-400 font-mono">{pageData.responseTimeMs}ms</strong></span>
            </div>
          </div>
        </div>

        {/* Severity Count Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/[0.06]">
          <button
            onClick={() => onNavigate('issues')}
            className="p-4 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-red-500/30 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">{t('common.critical')}</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-red-400 mt-1 tabular-nums">
              {healthScore.counts.critical}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {locale === 'vi' ? 'Yêu cầu khắc phục ngay' : 'Requires immediate fix'}
            </div>
          </button>

          <button
            onClick={() => onNavigate('issues')}
            className="p-4 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-[#FF5E00]/30 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">{t('common.high')}</span>
              <AlertTriangle className="w-4 h-4 text-[#FF8A3D]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#FF8A3D] mt-1 tabular-nums">
              {healthScore.counts.high}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {locale === 'vi' ? 'Nguy cơ ảnh hưởng thứ hạng' : 'Ranking risk factor'}
            </div>
          </button>

          <button
            onClick={() => onNavigate('issues')}
            className="p-4 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-amber-500/30 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">{t('common.medium')}</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
              {healthScore.counts.medium}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {locale === 'vi' ? 'Mục tiêu tối ưu hóa' : 'Optimization target'}
            </div>
          </button>

          <button
            onClick={() => onNavigate('issues')}
            className="p-4 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-blue-500/30 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">{t('common.low')}</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1 tabular-nums">
              {healthScore.counts.low}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {locale === 'vi' ? 'Cải thiện nhỏ' : 'Minor improvements'}
            </div>
          </button>

          <button
            onClick={() => onNavigate('issues')}
            className="p-4 rounded-2xl bg-[#141414] hover:bg-[#181818] border border-emerald-500/30 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">{t('common.passed')}</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
              {healthScore.counts.passed}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {locale === 'vi' ? 'Đã đạt tiêu chuẩn' : 'Validated rules'}
            </div>
          </button>
        </div>
      </div>

      {/* Category Health Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          {locale === 'vi' ? 'Phân bổ theo trụ cột SEO' : 'Diagnostic Pillar Breakdown'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(healthScore.categories) as [string, CategoryScore][]).map(([key, cat]) => (
            <div
              key={key}
              className="p-5 rounded-2xl bg-[#101010] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold">
                    {key === 'technical'
                      ? t('dashboard.technicalSeo')
                      : key === 'content'
                      ? t('dashboard.content')
                      : key === 'performance'
                      ? t('dashboard.performance')
                      : key === 'indexability'
                      ? t('dashboard.indexability')
                      : cat.label}
                  </span>
                  <span className="font-mono text-[11px]">
                    {cat.passedCount} {t('common.passed').toLowerCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black font-mono text-white tabular-nums">
                    {cat.score}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">/ 100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    cat.score >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : cat.score >= 75
                      ? 'bg-gradient-to-r from-[#FF5E00] to-[#FF8A3D]'
                      : 'bg-gradient-to-r from-red-500 to-amber-500'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Attention Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>
              {locale === 'vi' ? 'Vấn đề ưu tiên cần xử lý' : 'Critical & High Issues Requiring Action'}
            </span>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.06]">
              {t('common.issuesCount', { count: failedEvaluations.length })}
            </span>
          </h2>

          <button
            onClick={() => onNavigate('issues')}
            className="text-xs font-semibold text-[#FF8A3D] hover:text-[#FFA766] flex items-center gap-1 cursor-pointer"
          >
            <span>{t('dashboard.viewIssues')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {failedEvaluations.slice(0, 4).map((issue) => (
            <div
              key={issue.rule.id}
              className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#FF5E00]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      issue.rule.severity === 'critical'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-[#FF5E00]/10 text-[#FF8A3D] border-[#FF5E00]/20'
                    }`}
                  >
                    {issue.rule.severity}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">{issue.rule.id}</span>
                  <span className="text-xs text-neutral-400">
                    · {issue.affectedCount} {locale === 'vi' ? 'URL bị ảnh hưởng' : 'URL affected'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{issue.rule.name}</h3>
                <p className="text-xs text-neutral-400">{issue.evidence}</p>
                <div className="text-xs text-neutral-300 pt-1">
                  <span className="text-[#FF8A3D] font-medium">
                    {locale === 'vi' ? 'Tại sao điều này quan trọng: ' : 'Why it matters: '}
                  </span>
                  {issue.whyItMatters}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    onOpenFix(issue.rule.id, issue.rule.name, issue.rule.category, issue.suggestedPatch)
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-[#FF5E00]/40 hover:border-[#FF5E00] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#FF5E00]" />
                  <span>{t('issues.generateFix')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
