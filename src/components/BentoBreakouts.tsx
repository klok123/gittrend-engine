'use client';

import React from 'react';
import Link from 'next/link';
import { Star, GitFork, ArrowUp, Zap, Sparkles, Gem, ArrowRight, ShieldCheck } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

interface BentoBreakoutsProps {
  repositories: NormalizedTrendingRepo[];
}

export function BentoBreakouts({ repositories }: BentoBreakoutsProps) {
  if (!repositories || repositories.length === 0) return null;

  // 1. #1 Trending Breakout
  const topBreakout = repositories[0];

  // 2. Fastest Accelerating Star
  const fastestAccelerating = [...repositories].sort((a, b) => {
    const accelA = a.starsGainedToday - a.starsGainedWeek / 7;
    const accelB = b.starsGainedToday - b.starsGainedWeek / 7;
    return accelB - accelA;
  })[0] || repositories[1] || topBreakout;

  // 3. Top Organic Hidden Gem
  const topHiddenGem = repositories.find((r) => r.isHiddenGem && r.anomalyStatus === 'NORMAL') || repositories[2] || topBreakout;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FF7905]" />
            Featured Breakouts & Radar Spotlight
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Algorithmic highlights based on 24-hour star velocity, acceleration rate, and organic community trust
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tile 1: #1 Breakout of the Day (2 columns on desktop) */}
        {topBreakout && (
          <div className="lg:col-span-2 bg-[#11131F] border border-white/10 hover:border-[#FF7905]/40 rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-[#FF7905]/15 border border-[#FF7905]/30 text-[#FF7905] px-3 py-1 rounded-full font-mono text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-[#FF7905]"></span>
                  #1 BREAKOUT OF THE DAY
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: topBreakout.languageColor || '#888' }}
                  />
                  <span>{topBreakout.language}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={`https://github.com/${topBreakout.owner}.png?size=120`}
                  alt={`${topBreakout.owner} avatar`}
                  width={56}
                  height={56}
                  className="rounded-full border border-white/15 h-14 w-14 object-cover shrink-0 bg-slate-900"
                />

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/repo/${topBreakout.owner}/${topBreakout.name}`}
                    className="font-mono font-bold text-xl sm:text-2xl text-white group-hover:text-[#FF7905] transition-colors break-words"
                  >
                    <span className="text-slate-400 font-normal">{topBreakout.owner} / </span>
                    <span>{topBreakout.name}</span>
                  </Link>

                  <p className="text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {topBreakout.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 font-bold text-white text-base">
                  <Star className="h-4 w-4 text-[#FF7905] fill-[#FF7905]" />
                  {topBreakout.totalStars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs">
                  <ArrowUp className="h-3.5 w-3.5" />
                  +{topBreakout.starsGainedToday} today
                </span>
                <span className="hidden sm:flex items-center gap-1 text-slate-400">
                  <GitFork className="h-3.5 w-3.5" />
                  {topBreakout.forksCount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="hidden md:block">
                  <Sparkline data={topBreakout.sparkline} color="#FF7905" width={110} height={28} />
                </div>
                <Link
                  href={`/repo/${topBreakout.owner}/${topBreakout.name}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181A2B] hover:bg-[#FF7905] text-white hover:text-black font-mono text-xs font-bold rounded-lg border border-white/10 transition-all cursor-pointer"
                >
                  <span>Inspect Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: 2 Stacked Highlight Tiles */}
        <div className="space-y-4">
          {/* Tile 2: Fastest Accelerating Star */}
          {fastestAccelerating && (
            <div className="bg-[#11131F] border border-white/10 hover:border-amber-400/40 rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-200 group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="h-3.5 w-3.5" />
                    FASTEST ACCELERATING
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {fastestAccelerating.language}
                  </span>
                </div>

                <Link
                  href={`/repo/${fastestAccelerating.owner}/${fastestAccelerating.name}`}
                  className="font-mono font-bold text-base text-white group-hover:text-amber-400 transition-colors block mt-1 line-clamp-1"
                >
                  {fastestAccelerating.fullName}
                </Link>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {fastestAccelerating.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono mt-4 pt-3 border-t border-white/5">
                <span className="text-white font-bold">
                  ★ {fastestAccelerating.totalStars.toLocaleString()}
                </span>
                <span className="text-emerald-400 font-bold">
                  +{fastestAccelerating.starsGainedToday} today
                </span>
                <Link
                  href={`/repo/${fastestAccelerating.owner}/${fastestAccelerating.name}`}
                  className="text-slate-400 hover:text-white"
                >
                  Dossier →
                </Link>
              </div>
            </div>
          )}

          {/* Tile 3: Top Organic Hidden Gem */}
          {topHiddenGem && (
            <div className="bg-[#11131F] border border-white/10 hover:border-purple-400/40 rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-200 group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-0.5 rounded-full">
                    <Gem className="h-3.5 w-3.5" />
                    TOP HIDDEN GEM
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Grade A
                  </span>
                </div>

                <Link
                  href={`/repo/${topHiddenGem.owner}/${topHiddenGem.name}`}
                  className="font-mono font-bold text-base text-white group-hover:text-purple-400 transition-colors block mt-1 line-clamp-1"
                >
                  {topHiddenGem.fullName}
                </Link>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {topHiddenGem.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono mt-4 pt-3 border-t border-white/5">
                <span className="text-white font-bold">
                  ★ {topHiddenGem.totalStars.toLocaleString()}
                </span>
                <span className="text-purple-400 font-bold">
                  High Fork Dispersion
                </span>
                <Link
                  href={`/repo/${topHiddenGem.owner}/${topHiddenGem.name}`}
                  className="text-slate-400 hover:text-white"
                >
                  Dossier →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
