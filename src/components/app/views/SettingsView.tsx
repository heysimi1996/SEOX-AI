/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Key,
  Globe,
  Sliders,
  Database,
  Lock,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface IntegrationsStatus {
  googleSearchConsole?: { hasClientId?: boolean };
  serpProvider?: { configured?: boolean };
  backlinkProvider?: { configured?: boolean; activeProvider?: string };
  keywordVolume?: {
    ahrefs?: { configured?: boolean };
    dataforseo?: { configured?: boolean };
  };
}

export const SettingsView: React.FC = () => {
  const [integrationsStatus, setIntegrationsStatus] = useState<IntegrationsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/integrations/status')
      .then((res) => res.json())
      .then((data) => setIntegrationsStatus(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Platform Settings & Integrations</h2>
            <p className="text-neutral-400 text-xs mt-0.5">
              Manage telemetry connectors, environment keys, and diagnostic crawler thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Health Matrix */}
      <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
          External API & Service Connectors
        </h3>

        <div className="divide-y divide-white/[0.04]">
          {/* Google Search Console */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Google Search Console API</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300 border border-white/10">
                  OAuth 2.0 Client
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Authenticates webmaster properties for live clicks, impressions, CTR, and Google URL inspection index state.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                integrationsStatus?.googleSearchConsole?.hasClientId
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${integrationsStatus?.googleSearchConsole?.hasClientId ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              {integrationsStatus?.googleSearchConsole?.hasClientId ? 'OAuth Client Ready' : 'Direct Token Ready'}
            </span>
          </div>

          {/* SERP Keyword Provider */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>SERP Ranking Provider (SerpApi / DataForSEO)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300 border border-white/10">
                  SERP_API_KEY
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Provides location and device-specific Google Search positions and rich SERP feature detection without synthetic rankings.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                integrationsStatus?.serpProvider?.configured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${integrationsStatus?.serpProvider?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {integrationsStatus?.serpProvider?.configured ? 'Connected' : 'Not Configured'}
            </span>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Keyword Volume — Ahrefs</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300 border border-white/10">
                  AHREFS_API_KEY
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Country-level estimated monthly search volume, requested securely by the server.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${integrationsStatus?.keywordVolume?.ahrefs?.configured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-300'}`}>
              {integrationsStatus?.keywordVolume?.ahrefs?.configured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Keyword Volume — DataForSEO</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300 border border-white/10">
                  DATAFORSEO_LOGIN / PASSWORD
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Google Ads search volume estimates targeted to each selected country.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${integrationsStatus?.keywordVolume?.dataforseo?.configured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-300'}`}>
              {integrationsStatus?.keywordVolume?.dataforseo?.configured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          {/* Backlink Provider */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Backlink Provider Adapter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-white/10">
                  {integrationsStatus?.backlinkProvider?.activeProvider || 'DataForSEO'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Replaceable adapter supporting DataForSEO, Ahrefs, Semrush, Moz, and Majestic for backlink records and risk indicator calculation.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                integrationsStatus?.backlinkProvider?.configured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${integrationsStatus?.backlinkProvider?.configured ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              {integrationsStatus?.backlinkProvider?.configured ? 'Configured' : 'Adapter Ready'}
            </span>
          </div>

          {/* Gemini AI Engine */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Gemini 3.8 Flash AI Synthesis</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF5E00]/10 text-[#FF8A3D] border border-[#FF5E00]/20">
                  SDK Native
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Powers prioritized remediation roadmaps, issue explanations, and code fix generation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
