import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../../scripts/run-trend-etl';
import { isVerifiedRising } from '../../engine/ranking';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { RepoCard } from '../../components/RepoCard';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rising GitHub Repositories | GitTrend',
  description: 'Fastest-accelerating GitHub repositories by proportional growth and velocity momentum.',
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

export default function RisingPage() {
  const data = getTrendingData();
  const risingRepos = data.repositories
    .filter(isVerifiedRising)
    .sort((a, b) => b.breakoutScore - a.breakoutScore);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-slate-900 font-sans">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 p-6 bg-amber-50 border-2 border-black rounded-lg shadow-[3px_3px_0_0_#000]">
          <div className="flex items-center gap-2 text-amber-900 font-bold font-mono text-sm">
            <Sparkles className="h-5 w-5 text-amber-600" />
            ACCELERATION LEADERBOARD
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black font-mono mt-2">
            Rising Repositories
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl font-medium">
            Projects demonstrating the highest proportional growth relative to their initial star base.
          </p>
        </div>

        <div className="space-y-3.5">
          {risingRepos.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500 font-mono text-sm">
                No repositories currently meet the Rising Star breakout criteria (&gt; 15% acceleration under 10k stars).
              </p>
            </div>
          ) : (
            risingRepos.map((repo, idx) => (
              <RepoCard key={repo.id} repo={repo} rank={idx + 1} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
