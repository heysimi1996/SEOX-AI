import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Zap,
  Globe,
  GitBranch,
  ShieldCheck,
  FileCode,
  FileText,
  Activity,
  Brain,
  Download,
  Settings,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Link2,
  Users,
  Bot,
  FileSearch,
  BarChart3,
} from 'lucide-react';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from '../../rules/types';
import { OverviewView } from './views/OverviewView';
import { QuickAuditView } from './views/QuickAuditView';
import { FullSiteAuditView } from './views/FullSiteAuditView';
import { PagesView } from './views/PagesView';
import { IssueCenterView } from './views/IssueCenterView';
import { TechnicalSeoView } from './views/TechnicalSeoView';
import { PerformanceView } from './views/PerformanceView';
import { IntelligenceView } from './views/IntelligenceView';
import { DomainView } from './views/DomainView';
import { AiCopilotView } from './views/AiCopilotView';
import { ReportsView } from './views/ReportsView';
import { GscView } from './views/GscView';
import { RankingsView } from './views/RankingsView';
import { KeywordVolumeView } from './views/KeywordVolumeView';
import { BacklinksView } from './views/BacklinksView';
import { CompetitorsView } from './views/CompetitorsView';
import { AiSearchSignalsView } from './views/AiSearchSignalsView';
import { SettingsView } from './views/SettingsView';
import { FixGeneratorModal } from './FixGeneratorModal';
import { useI18n } from '../../i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface AppLayoutProps {
  onBackToMarketing: () => void;
  initialTargetUrl?: string;
  initialPageData: PageAuditData;
  initialEvaluations: RuleEvaluationResult[];
  initialHealthScore: OverallHealthScore;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onBackToMarketing,
  initialTargetUrl,
  initialPageData,
  initialEvaluations,
  initialHealthScore,
}) => {
  const { t, locale } = useI18n();
  const [currentView, setCurrentView] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App-wide audit data state
  const [pageData, setPageData] = useState<PageAuditData>(initialPageData);
  const [evaluations, setEvaluations] = useState<RuleEvaluationResult[]>(initialEvaluations);
  const [healthScore, setHealthScore] = useState<OverallHealthScore>(initialHealthScore);

  // Selected page for /pages/[id] drill-down
  const [selectedPageForDrilldown, setSelectedPageForDrilldown] = useState<any | null>(null);

  // Fix Generator Modal State
  const [fixModalState, setFixModalState] = useState<{
    isOpen: boolean;
    issueId: string;
    issueTitle: string;
    category: string;
    snippet?: string;
  }>({
    isOpen: false,
    issueId: '',
    issueTitle: '',
    category: '',
  });

  const handleOpenFix = (ruleId: string, ruleName: string, category: string, snippet?: string) => {
    setFixModalState({
      isOpen: true,
      issueId: ruleId,
      issueTitle: ruleName,
      category,
      snippet,
    });
  };

  const handleExplainWithAi = (issue: RuleEvaluationResult) => {
    setCurrentView('copilot');
  };

  const handleAuditComplete = (newData: PageAuditData, newEvals: RuleEvaluationResult[], newScore: OverallHealthScore) => {
    setPageData(newData);
    setEvaluations(newEvals);
    setHealthScore(newScore);
  };

  const handleSelectPage = (p: any) => {
    setSelectedPageForDrilldown(p);
    setCurrentView('pages');
  };

  // Navigation groupings
  const navSections = [
    {
      group: locale === 'vi' ? 'Tổng quan' : 'Core',
      items: [
        { id: 'overview', label: t('navigation.overview'), icon: LayoutDashboard },
        { id: 'issues', label: t('navigation.issueCenter'), icon: Activity, badge: evaluations.filter(e => !e.passed).length },
      ],
    },
    {
      group: locale === 'vi' ? 'Kiểm tra SEO' : 'Audits',
      items: [
        { id: 'quick-audit', label: t('navigation.quickAudit'), icon: Search },
        { id: 'full-audit', label: t('navigation.fullAudit'), icon: Play },
        { id: 'pages', label: t('navigation.analyzedPages'), icon: FileText },
      ],
    },
    {
      group: locale === 'vi' ? 'Tìm kiếm & Thứ hạng' : 'Search & Rankings',
      items: [
        { id: 'gsc', label: t('navigation.gsc'), icon: FileSearch },
        { id: 'rankings', label: t('navigation.keywordTracking'), icon: TrendingUp },
        { id: 'keyword-volume', label: 'Keyword Volume', icon: BarChart3 },
      ],
    },
    {
      group: locale === 'vi' ? 'Authority & Đối thủ' : 'Authority & Rivals',
      items: [
        { id: 'backlinks', label: t('navigation.backlinks'), icon: Link2 },
        { id: 'competitors', label: t('navigation.competitors'), icon: Users },
      ],
    },
    {
      group: locale === 'vi' ? 'Kỹ thuật & Tín hiệu' : 'Telemetry & Signals',
      items: [
        { id: 'technical', label: t('navigation.technicalSeo'), icon: FileCode },
        { id: 'performance', label: t('navigation.performance'), icon: Zap },
        { id: 'intelligence', label: t('navigation.content'), icon: Brain },
        { id: 'aisearch', label: t('navigation.aiSearch'), icon: Bot },
        { id: 'domain', label: t('navigation.domain'), icon: Globe },
      ],
    },
    {
      group: locale === 'vi' ? 'Trợ lý AI & Báo cáo' : 'Intelligence',
      items: [
        { id: 'copilot', label: t('navigation.aiCopilot'), icon: Sparkles },
        { id: 'reports', label: t('navigation.reports'), icon: Download },
        { id: 'settings', label: t('navigation.settings'), icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <header className="h-16 bg-[#0D0D0D] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 backdrop-blur-md">
        {/* Left: Brand + Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToMarketing();
            }}
            className="flex items-center gap-2 group tracking-tight text-white font-extrabold text-lg cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF5E00] to-[#E63900] flex items-center justify-center shadow-md shadow-[#FF5E00]/25">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span>
              SEOX<span className="text-[#FF5E00] ml-1">AI</span>
            </span>
          </a>

          <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-white/[0.08] text-xs font-mono text-neutral-400">
            <span>Target:</span>
            <span className="text-white font-bold max-w-[200px] truncate">{pageData.url}</span>
          </div>
        </div>

        {/* Right: Actions + Return to website */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Health Score Pill */}
          <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] uppercase font-semibold text-neutral-400">{t('common.score')}</span>
            <span className="font-mono font-bold text-white text-xs">{healthScore.score}</span>
            <span className="text-[10px] font-mono text-emerald-400">+{healthScore.trend}</span>
          </div>

          <button
            onClick={() => setCurrentView('quick-audit')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6D1A] shadow-md shadow-[#FF5E00]/25 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('navigation.quickAudit')}</span>
          </button>

          <button
            onClick={onBackToMarketing}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('navigation.backToHome')}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`w-64 bg-[#0A0A0A] border-r border-white/[0.08] p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-all duration-200 ${
            mobileMenuOpen ? 'fixed inset-y-16 left-0 z-50 shadow-2xl block w-72' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-6">
            {navSections.map((sec) => (
              <div key={sec.group} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 px-3">
                  {sec.group}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#FF5E00] text-white shadow-md shadow-[#FF5E00]/25'
                            : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                              isActive ? 'bg-black/30 text-white' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Telemetry Status */}
          <div className="pt-4 border-t border-white/[0.06] text-[11px] text-neutral-500 font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span>ENGINE:</span>
              <span className="text-emerald-400 font-bold">READY (v2.4)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SSRF FILTER:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
            {currentView === 'overview' && (
              <OverviewView
                pageData={pageData}
                evaluations={evaluations}
                healthScore={healthScore}
                onNavigate={(v) => setCurrentView(v)}
                onOpenFix={handleOpenFix}
              />
            )}

            {currentView === 'quick-audit' && (
              <QuickAuditView
                pageData={pageData}
                evaluations={evaluations}
                healthScore={healthScore}
                onAuditComplete={handleAuditComplete}
                onOpenFix={handleOpenFix}
              />
            )}

            {currentView === 'full-audit' && (
              <FullSiteAuditView
                currentDomain={pageData.url}
                onSelectPage={handleSelectPage}
              />
            )}

            {currentView === 'pages' && (
              <PagesView
                selectedPage={selectedPageForDrilldown}
                onBackToList={() => setSelectedPageForDrilldown(null)}
                defaultData={pageData}
              />
            )}

            {currentView === 'issues' && (
              <IssueCenterView
                evaluations={evaluations}
                onOpenFix={handleOpenFix}
                onExplainWithAi={handleExplainWithAi}
              />
            )}

            {currentView === 'technical' && (
              <TechnicalSeoView
                pageData={pageData}
                onOpenFix={handleOpenFix}
              />
            )}

            {currentView === 'performance' && (
              <PerformanceView pageData={pageData} />
            )}

            {currentView === 'intelligence' && (
              <IntelligenceView />
            )}

            {currentView === 'domain' && (
              <DomainView pageData={pageData} />
            )}

            {currentView === 'copilot' && (
              <AiCopilotView
                pageData={pageData}
                evaluations={evaluations}
                healthScore={healthScore}
                onOpenFix={handleOpenFix}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                pageData={pageData}
                evaluations={evaluations}
                healthScore={healthScore}
              />
            )}

            {currentView === 'gsc' && (
              <GscView currentDomain={pageData.url} />
            )}

            {currentView === 'rankings' && (
              <RankingsView currentDomain={pageData.url} />
            )}

            {currentView === 'keyword-volume' && (
              <KeywordVolumeView />
            )}

            {currentView === 'backlinks' && (
              <BacklinksView currentDomain={pageData.url} />
            )}

            {currentView === 'competitors' && (
              <CompetitorsView currentDomain={pageData.url} />
            )}

            {currentView === 'aisearch' && (
              <AiSearchSignalsView pageData={pageData} />
            )}

            {currentView === 'settings' && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      {/* Code Fix Generator Modal */}
      <FixGeneratorModal
        isOpen={fixModalState.isOpen}
        onClose={() => setFixModalState((prev) => ({ ...prev, isOpen: false }))}
        issueId={fixModalState.issueId}
        issueTitle={fixModalState.issueTitle}
        category={fixModalState.category}
        defaultSnippet={fixModalState.snippet}
        targetUrl={pageData.url}
      />
    </div>
  );
};
