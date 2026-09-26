/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './sections/HeroSection';
import { SocialProofSection } from './sections/SocialProofSection';
import { FeatureShowcaseSection } from './sections/FeatureShowcaseSection';
import { InteractiveCardsSection } from './sections/InteractiveCardsSection';
import { ProductPreviewSection } from './sections/ProductPreviewSection';
import { AICopilotSection } from './sections/AICopilotSection';
import { WaveVisualSection } from './sections/WaveVisualSection';
import { AuditCtaSection } from './sections/AuditCtaSection';
import { Footer } from './components/Footer';
import { AuditModal } from './components/AuditModal';
import { AuthModal } from './components/AuthModal';
import { AppLayout } from './components/app/AppLayout';
import {
  DEFAULT_INITIAL_PAGE_DATA,
  INITIAL_EVALUATIONS,
  INITIAL_HEALTH_SCORE,
} from './components/app/initialAuditState';
import { PageAuditData, RuleEvaluationResult, OverallHealthScore } from './rules/types';

export default function App() {
  const [appMode, setAppMode] = useState<'marketing' | 'app'>('marketing');
  const [auditTargetUrl, setAuditTargetUrl] = useState<string>('https://yourwebsite.com');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup';
  }>({
    isOpen: false,
    mode: 'signup',
  });

  // App-level state for functional audit application
  const [activePageData, setActivePageData] = useState<PageAuditData>(DEFAULT_INITIAL_PAGE_DATA);
  const [activeEvaluations, setActiveEvaluations] = useState<RuleEvaluationResult[]>(INITIAL_EVALUATIONS);
  const [activeHealthScore, setActiveHealthScore] = useState<OverallHealthScore>(INITIAL_HEALTH_SCORE);

  const handleStartAudit = (url?: string) => {
    if (url) {
      setAuditTargetUrl(url);
      setActivePageData((prev) => ({ ...prev, url, finalUrl: url }));
    }
    // Launch directly into functional dashboard
    setAppMode('app');
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalState({
      isOpen: true,
      mode,
    });
  };

  const handleExplorePlatform = () => {
    setAppMode('app');
  };

  // If in Main Application Mode, render full AppLayout dashboard
  if (appMode === 'app') {
    return (
      <AppLayout
        onBackToMarketing={() => setAppMode('marketing')}
        initialTargetUrl={auditTargetUrl}
        initialPageData={activePageData}
        initialEvaluations={activeEvaluations}
        initialHealthScore={activeHealthScore}
      />
    );
  }

  // Otherwise render Marketing Homepage
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5E00]/30 selection:text-[#FF8A3D] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        onOpenAudit={() => handleStartAudit()}
        onOpenAuth={handleOpenAuth}
        onOpenApp={() => setAppMode('app')}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          onAnalyze={handleStartAudit}
          onExplore={handleExplorePlatform}
        />

        {/* Social Proof Section */}
        <SocialProofSection />

        {/* Feature Showcase (3 Large Cards) */}
        <FeatureShowcaseSection />

        {/* Modular Diagnostic Engines (Interactive Feature Cards) */}
        <InteractiveCardsSection />

        {/* Real Product Dashboard Preview */}
        <ProductPreviewSection />

        {/* AI Copilot Section */}
        <AICopilotSection />

        {/* Flowing Wave / Mesh Section */}
        <WaveVisualSection />

        {/* SEO Audit CTA Section */}
        <AuditCtaSection onAnalyze={handleStartAudit} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Audit Simulation Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        targetUrl={auditTargetUrl}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        onClose={() => setAuthModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
