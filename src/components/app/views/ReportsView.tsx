import React from 'react';
import { Download, FileText, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from '@/src/rules/types';

interface ReportsViewProps {
  pageData: PageAuditData;
  evaluations: RuleEvaluationResult[];
  healthScore: OverallHealthScore;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  pageData,
  evaluations,
  healthScore,
}) => {
  const handleExportJson = () => {
    const report = {
      platform: 'SEOX AI Intelligence',
      target: pageData.url,
      timestamp: new Date().toISOString(),
      healthScore,
      evaluations,
      pageData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seox-audit-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['Rule ID', 'Name', 'Category', 'Severity', 'Passed', 'Evidence', 'Recommendation'];
    const rows = evaluations.map((e) => [
      e.rule.id,
      `"${e.rule.name.replace(/"/g, '""')}"`,
      e.rule.category,
      e.rule.severity,
      e.passed ? 'PASSED' : 'FAILED',
      `"${e.evidence.replace(/"/g, '""')}"`,
      `"${e.recommendedFix.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seox-issues-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Data Export & Stakeholder Deliverables
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Audit Reports & Historical Snapshots
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Export full technical telemetry, compliance checklists, and issue logs in structured
            JSON or tabular CSV formats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={handleExportJson}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FF5E00] hover:bg-[#FF6D1A] flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF5E00]/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete JSON Audit</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Issues CSV</span>
          </button>
        </div>
      </div>

      {/* Snapshot Preview */}
      <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/[0.08] space-y-4">
        <h3 className="text-base font-bold text-white">Current Audit Snapshot Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
            <div className="text-neutral-500 font-mono">Target Domain</div>
            <div className="font-mono text-white font-bold mt-1 truncate">{pageData.url}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
            <div className="text-neutral-500 font-mono">SEO Health Score</div>
            <div className="font-mono text-emerald-400 font-bold mt-1 text-lg">{healthScore.score} / 100</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
            <div className="text-neutral-500 font-mono">Total Checkpoints</div>
            <div className="font-mono text-white font-bold mt-1 text-lg">{evaluations.length} Rules</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
            <div className="text-neutral-500 font-mono">Timestamp</div>
            <div className="font-mono text-neutral-300 mt-1">Just now</div>
          </div>
        </div>
      </div>
    </div>
  );
};
