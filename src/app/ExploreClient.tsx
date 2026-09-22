'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Gem, ArrowUpRight, Flame, Layers } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RepoCard } from '../components/RepoCard';
import { TimeFilter } from '../components/TimeFilter';
import { LanguageFilter } from '../components/LanguageFilter';
import { SearchModal } from '../components/SearchModal';
import { PlatformTelemetry } from '../components/PlatformTelemetry';
import { BentoBreakouts } from '../components/BentoBreakouts';
import { TrendingDataset } from '../../scripts/run-trend-etl';

interface ExploreClientProps {
  initialData: TrendingDataset;
}

export function ExploreClient({ initialData }: ExploreClientProps) {
  const [timeWindow, setTimeWindow] = useState<'today' | 'week' | 'month'>('today');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter and sort repositories based on language, anomaly status, and timeWindow
  const filteredRepos = useMemo(() => {
    // Exclude anomalous signals from default trending feed per methodology
    let list = initialData.repositories.filter((r) => r.anomalyStatus !== 'ANOMALOUS SIGNAL');

    if (selectedLanguage !== 'All') {
      list = list.filter((r) => r.language.toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Dynamic re-sorting according to the selected time window
    const sorted = [...list];
    if (timeWindow === 'week') {
      sorted.sort((a, b) => b.starsGainedWeek - a.starsGainedWeek);
    } else if (timeWindow === 'month') {
      sorted.sort((a, b) => b.starsGainedMonth - a.starsGainedMonth);
    } else {
      sorted.sort((a, b) => b.velocityScore - a.velocityScore);
    }

    return sorted;
  }, [initialData.repositories, selectedLanguage, timeWindow]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Live Platform Mission Control Telemetry */}
        <PlatformTelemetry
          totalRepos={initialData.totalRepos}
          dataSource={initialData.dataSource}
          isBaselineSeed={initialData.isBaselineSeed}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Hero Headline Section (Strict 2-line rule) */}
        <section className="mb-10 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF7905]"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Algorithmic Star Velocity &amp; Fraud Audit
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-mono max-w-4xl">
            GitHub Trend Intelligence <br className="hidden sm:inline" />
            <span className="text-[#FF7905]">without the Bot Star Fraud.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-sans">
            Real-time star velocity calculations, community fork dispersion auditing, and authentic hidden gem discovery across 10 top languages.
          </p>
        </section>

        {/* Bento Grid: Featured Breakouts */}
        <BentoBreakouts repositories={initialData.repositories} />

        {/* Control Bar: Feed Header, TimeFilter, LanguageFilter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pt-6 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-[#FF7905]" />
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
                Trending Leaderboard
              </h2>
              <span className="text-xs font-mono bg-white/10 text-slate-300 border border-white/15 rounded-full px-2.5 py-0.5">
                {filteredRepos.length} repositories
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {timeWindow === 'today' && 'Ranked by Momentum-Log: (stars gained)² ÷ ln(total stars + 10)'}
              {timeWindow === 'week' && 'Ranked by 7-day cumulative star velocity'}
              {timeWindow === 'month' && 'Ranked by 30-day cumulative star velocity'}
              {' · '}
              <Link href="/methodology" className="text-[#FF7905] hover:underline">
                View mathematical formulas →
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <TimeFilter selected={timeWindow} onChange={setTimeWindow} />

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/rising"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Rising</span>
              </Link>
              <Link
                href="/hidden-gems"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-purple-300 bg-purple-400/10 border border-purple-400/20 rounded-lg hover:bg-purple-400/20 transition-colors"
              >
                <Gem className="h-3.5 w-3.5" />
                <span>Gems</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Language Filter Bar */}
        <div className="mb-6">
          <LanguageFilter
            languages={initialData.languages}
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        </div>

        {/* Main Repository Feed */}
        <div className="space-y-3">
          {filteredRepos.length === 0 ? (
            <div className="text-center py-16 bg-[#11131F] border border-white/10 rounded-xl">
              <p className="text-slate-400 font-mono text-sm">
                No repositories found matching language &ldquo;{selectedLanguage}&rdquo;.
              </p>
            </div>
          ) : (
            filteredRepos.map((repo, idx) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                rank={idx + 1}
                timeWindow={timeWindow}
              />
            ))
          )}
        </div>
      </main>

      <Footer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        repositories={initialData.repositories}
      />
    </div>
  );
}
