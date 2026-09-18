import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../../scripts/run-trend-etl';
import { isVerifiedHiddenGem } from '../../engine/ranking';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { RepoCard } from '../../components/RepoCard';
import { Gem } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hidden Gems | GitHub Trend Intelligence',
  description: 'High-momentum developer repositories under 1,500 total stars.',
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

export default function HiddenGemsPage() {
  const data = getTrendingData();
  const gemRepos = data.repositories
    .filter(isVerifiedHiddenGem)
    .sort((a, b) => b.velocityScore - a.velocityScore);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-slate-900 font-sans">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 p-6 bg-purple-50 border-2 border-black rounded-lg shadow-[3px_3px_0_0_#000]">
          <div className="flex items-center gap-2 text-purple-900 font-bold font-mono text-sm">
            <Gem className="h-5 w-5 text-purple-600" />
            EARLY-STAGE DISCOVERY
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black font-mono mt-2">
            Hidden Gems
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl font-medium">
            High-momentum developer repositories under 1,500 total stars with verified organic adoption and healthy fork ratios.
          </p>
        </div>

        <div className="space-y-3.5">
          {gemRepos.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500 font-mono text-sm">
                No repositories currently meet the strict Hidden Gem criteria (&lt; 1,500 stars, &ge; 25 stars/day, &ge; 3 forks).
              </p>
            </div>
          ) : (
            gemRepos.map((repo, idx) => (
              <RepoCard key={repo.id} repo={repo} rank={idx + 1} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
