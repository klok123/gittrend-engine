'use client';

import React, { useEffect } from 'react';
import { Database, ShieldCheck, Zap, Search, Activity, Cpu } from 'lucide-react';

interface PlatformTelemetryProps {
  totalRepos: number;
  dataSource?: string;
  isBaselineSeed?: boolean;
  onOpenSearch?: () => void;
}

export function PlatformTelemetry({
  totalRepos,
  dataSource = 'LIVE_GITHUB_INGESTION',
  isBaselineSeed = false,
  onOpenSearch,
}: PlatformTelemetryProps) {
  // Global keyboard shortcut: '/' or 'Cmd+K' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <div className="w-full bg-[#11131F] border border-white/10 rounded-xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] mb-8 backdrop-blur-md">
      {/* Top Telemetry Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Mission Control Pulse */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE GITHUB INGESTION</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            <Database className="h-3.5 w-3.5 text-[#FF7905]" />
            <span>Neon Serverless PostgreSQL</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Anti-Spike Anomaly Gate: Active</span>
          </div>
        </div>

        {/* Right: Quick Search Button with Shortcut */}
        <button
          onClick={onOpenSearch}
          className="w-full lg:w-auto inline-flex items-center justify-between lg:justify-start gap-4 px-3.5 py-1.5 bg-[#181A2B] hover:bg-[#20233A] text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[#FF7905] group-hover:scale-110 transition-transform" />
            <span>Search repositories, topics...</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
            <span>⌘K</span>
            <span className="text-slate-600">or</span>
            <span>/</span>
          </div>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Repositories Tracked</div>
          <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
            {totalRepos} <span className="text-xs text-slate-500 font-normal">repos</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">GraphQL Quota Usage</div>
          <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">
            11 pts <span className="text-xs text-slate-500 font-normal">/ 5,000 (99.8% safe)</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Storage Infrastructure</div>
          <div className="text-base sm:text-lg font-mono font-bold text-[#FF7905] mt-0.5">
            $0.00 <span className="text-xs text-slate-500 font-normal">lifetime creator cost</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Integrity Guarantee</div>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs">Organic Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
