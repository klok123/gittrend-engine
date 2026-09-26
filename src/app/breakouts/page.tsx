import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../../scripts/run-trend-etl';
import { isVerifiedRising } from '../../engine/ranking';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { RepoCard } from '../../components/RepoCard';
import { Zap, Radar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Breakout Radar — repos caught before they go viral | RepoPicks',
  description:
    'Early-breakout radar: open-source repositories caught by RepoPicks while still small, ranked by breakout momentum. Updated automatically every 6 hours.',
};

export const revalidate = 3600;

function getTrendingData(): TrendingDataset {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {
    console.error(e);
  }
  return { updatedAt: '', totalRepos: 0, repositories: [], languages: [], risingCount: 0, hiddenGemsCount: 0, anomalousCount: 0 };
}

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

export default function BreakoutsPage() {
  const data = getTrendingData();
  const breakoutRepos = data.repositories
    .filter(isVerifiedRising)
    .sort((a, b) => b.breakoutScore - a.breakoutScore);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 p-6 bg-[#11131F] border border-[#FF7905]/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-[#FF7905] font-bold font-mono text-xs uppercase tracking-wider">
            <Radar className="h-4 w-4 text-[#FF7905]" />
            Early-breakout radar
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mt-2">
            Breakouts
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
            Repositories caught by the radar while still small — ranked by breakout momentum,
            not total fame. Each card is stamped with the star count at the moment of capture,
            so you can see exactly how early it was spotted. Refreshed automatically every 6 hours.
          </p>
        </div>

        <div className="space-y-3">
          {breakoutRepos.length === 0 ? (
            <div className="text-center py-16 bg-[#11131F] border border-white/10 rounded-xl">
              <p className="text-slate-400 font-mono text-sm">
                No breakouts on the radar right now — check back after the next data refresh.
              </p>
            </div>
          ) : (
            breakoutRepos.map((repo, idx) => (
              <div key={repo.id}>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#FF7905] bg-[#FF7905]/10 border border-[#FF7905]/30 rounded-full px-2.5 py-0.5">
                    <Zap className="h-3 w-3" />
                    Caught at {formatStars(repo.totalStars)} stars
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    +{repo.starsGainedToday} in the last 24h
                  </span>
                </div>
                <RepoCard repo={repo} rank={idx + 1} timeWindow="today" />
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
