import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  Lock,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { PageAuditData } from '@/src/rules/types';

interface DomainViewProps {
  pageData: PageAuditData;
}

export const DomainView: React.FC<DomainViewProps> = ({ pageData }) => {
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupComplete, setLookupComplete] = useState(false);
  const [domainInfo, setDomainInfo] = useState<{
    domain: string;
    dns: {
      a: string[];
      aaaa: string[];
      mx: Array<{ exchange: string; priority: number }>;
      txt: string[];
      ns: string[];
    };
    ssl: {
      issuer: string;
      validFrom: string;
      validUntil: string;
      daysRemaining: number;
    } | null;
  }>({
    domain: '',
    dns: { a: [], aaaa: [], mx: [], txt: [], ns: [] },
    ssl: null,
  });

  const parsedHostname = (() => {
    try {
      return new URL(pageData.url).hostname;
    } catch {
      return 'example.com';
    }
  })();

  useEffect(() => {
    setLoading(true);
    setLookupError('');
    setLookupComplete(false);
    fetch(`/api/domain/lookup?domain=${encodeURIComponent(parsedHostname)}`)
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!response.ok) throw new Error(data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'Domain lookup failed.');
        if (!data || typeof data !== 'object' || !('dns' in data)) throw new Error('Domain lookup response was invalid.');
        setDomainInfo(data as typeof domainInfo);
        setLookupComplete(true);
      })
      .catch((error: unknown) => setLookupError(error instanceof Error ? error.message : 'Domain lookup failed.'))
      .finally(() => setLoading(false));
  }, [parsedHostname]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#111111] border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5E00] uppercase">
            Public Telemetry & Infrastructure
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Domain, DNS & SSL Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Live DNS zone resolution, certificate life-cycle telemetry, and public transport infrastructure.
            Guaranteed strictly public data inspection without guessing private records.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 text-xs font-mono text-neutral-400 border-t border-white/[0.06]">
          <span>Resolved Host: <strong className="text-white">{parsedHostname}</strong></span>
          <span>·</span>
          <span>Status: <strong className={lookupError ? 'text-rose-400' : 'text-neutral-300'}>{loading ? 'Resolving' : lookupError ? 'Unavailable' : lookupComplete ? 'Lookup complete' : 'Not checked'}</strong></span>
        </div>
      </div>

      {lookupError && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">{lookupError}</div>}

      {/* SSL Certificate Card */}
      <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SSL / TLS Certificate Status</h3>
              <p className="text-xs text-neutral-400">Transport encryption integrity check</p>
            </div>
          </div>

          {domainInfo.ssl && <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">{domainInfo.ssl.daysRemaining} Days Remaining</span>}
        </div>

        {domainInfo.ssl ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-neutral-500">Certificate Issuer</div>
              <div className="font-semibold text-white mt-1 truncate">{domainInfo.ssl.issuer}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-neutral-500">Valid From</div>
              <div className="font-mono text-white mt-1">{domainInfo.ssl.validFrom}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06]">
              <div className="text-neutral-500">Valid Until</div>
              <div className="font-mono text-white mt-1">{domainInfo.ssl.validUntil}</div>
            </div>
          </div>
        ) : <p className="text-sm text-neutral-400">{lookupComplete ? 'No TLS certificate details were returned for this host.' : 'Certificate details appear after a live lookup.'}</p>}
      </div>

      {/* DNS Records */}
      <div className="rounded-3xl bg-[#0F0F0F] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-[#FF5E00]" />
          <span>Resolved Public DNS Zone Records</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* A Records */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
            <div className="font-mono font-bold text-[#FF8A3D] uppercase">A Records (IPv4)</div>
            <div className="font-mono text-neutral-300 space-y-1">
              {domainInfo.dns.a.length ? domainInfo.dns.a.map((ip, i) => <div key={i}>• {ip}</div>) : <div className="text-neutral-500">{lookupComplete ? 'No records returned' : 'Awaiting lookup'}</div>}
            </div>
          </div>

          {/* AAAA Records */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
            <div className="font-mono font-bold text-[#FF8A3D] uppercase">AAAA Records (IPv6)</div>
            <div className="font-mono text-neutral-300 space-y-1">
              {domainInfo.dns.aaaa.length ? domainInfo.dns.aaaa.map((ip, i) => <div key={i} className="truncate">• {ip}</div>) : <div className="text-neutral-500">{lookupComplete ? 'No records returned' : 'Awaiting lookup'}</div>}
            </div>
          </div>

          {/* MX Records */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
            <div className="font-mono font-bold text-[#FF8A3D] uppercase">MX Records (Mail Routing)</div>
            <div className="font-mono text-neutral-300 space-y-1">
              {domainInfo.dns.mx.length ? domainInfo.dns.mx.map((mx, i) => <div key={i}>• Priority {mx.priority}: {mx.exchange}</div>) : <div className="text-neutral-500">{lookupComplete ? 'No records returned' : 'Awaiting lookup'}</div>}
            </div>
          </div>

          {/* NS Records */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
            <div className="font-mono font-bold text-[#FF8A3D] uppercase">NS Records (Nameservers)</div>
            <div className="font-mono text-neutral-300 space-y-1">
              {domainInfo.dns.ns.length ? domainInfo.dns.ns.map((ns, i) => <div key={i}>• {ns}</div>) : <div className="text-neutral-500">{lookupComplete ? 'No records returned' : 'Awaiting lookup'}</div>}
            </div>
          </div>
        </div>

        {/* TXT Records */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2 text-xs">
          <div className="font-mono font-bold text-[#FF8A3D] uppercase">TXT Records (SPF & Verifications)</div>
          <div className="font-mono text-neutral-300 space-y-1 max-h-40 overflow-y-auto">
            {domainInfo.dns.txt.length ? domainInfo.dns.txt.map((txt, i) => (
              <div key={i} className="p-2 rounded-lg bg-[#080808] break-all">
                "{txt}"
              </div>
            )) : <div className="text-neutral-500">{lookupComplete ? 'No records returned' : 'Awaiting lookup'}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
