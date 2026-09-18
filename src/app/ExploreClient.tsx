'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Gem, ArrowUpRight, Flame } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { RepoCard } from '../components/RepoCard';
import { TimeFilter } from '../components/TimeFilter';
import { LanguageFilter } from '../components/LanguageFilter';
import { SearchModal } from '../components/SearchModal';
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
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-slate-900 font-sans">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Hero Section */}
        <section className="text-center py-6 sm:py-10 border-b-2 border-black mb-8 bg-white rounded-lg p-6 shadow-[3px_3px_0_0_#000]">
          {initialData.isBaselineSeed ? (
            <div className="mb-4 inline-flex items-center gap-2 bg-amber-100 border-2 border-black px-3 py-1 rounded-md text-xs font-bold text-amber-950 font-mono shadow-[2px_2px_0_0_#000]">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              DEVELOPMENT BASELINE MODE — Staging Data (Add PAT_GITHUB_TOKEN for Live Ingestion)
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-black px-3 py-1 rounded-full text-xs font-bold text-black font-mono mb-4">
              <Flame className="h-4 w-4 text-emerald-600" />
              LIVE GITHUB INGESTION — Tracking {initialData.totalRepos} Active Repositories
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight font-mono">
            Discover what developers
            <br />
            <span className="text-[#FF7905] underline decoration-black decoration-4">
              are building right now
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-xl mx-auto font-medium">
            Uncover breakout open-source projects, high-velocity developer tools, and hidden gems ranked by verified star momentum.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 max-w-lg mx-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search repositories, topics, tags"
              className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-black rounded-md shadow-[2.5px_2.5px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-px transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Search className="h-4 w-4" />
                <span className="text-sm font-mono">Search repositories, topics, tags...</span>
              </div>
              <kbd className="hidden sm:inline-block text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-slate-600">
                ⌘K
              </kbd>
            </button>
          </div>
        </section>

        {/* Control Bar: Title, TimeFilter, LanguageFilter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-black font-mono">
                Trending Repositories
              </h2>
              <span className="text-xs font-mono bg-slate-200 border border-black/20 rounded px-2 py-0.5">
                {filteredRepos.length} results
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {timeWindow === 'today' && 'Ranked by Momentum-Log: (stars gained)² ÷ ln(total stars + 10)'}
              {timeWindow === 'week' && 'Ranked by 7-day cumulative star acceleration'}
              {timeWindow === 'month' && 'Ranked by 30-day cumulative star acceleration'}
              {' · '}
              <Link href="/methodology" className="text-[#FF7905] underline hover:text-black">
                How it works
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <TimeFilter selected={timeWindow} onChange={setTimeWindow} />

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/rising"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-black bg-amber-100 border-[1.5px] border-black rounded-md hover:bg-amber-200 transition-colors shadow-[1px_1px_0_0_#000]"
              >
                <Sparkles className="h-3.5 w-3.5" /> Rising
              </Link>
              <Link
                href="/hidden-gems"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-black bg-purple-100 border-[1.5px] border-black rounded-md hover:bg-purple-200 transition-colors shadow-[1px_1px_0_0_#000]"
              >
                <Gem className="h-3.5 w-3.5" /> Gems
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

        {/* Repository Cards Feed */}
        <div className="space-y-3.5">
          {filteredRepos.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500 font-mono text-sm">
                No repositories found in &ldquo;{selectedLanguage}&rdquo;.
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
