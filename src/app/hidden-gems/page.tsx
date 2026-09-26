import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../../scripts/run-trend-etl';
import { isVerifiedHiddenGem } from '../../engine/ranking';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { RepoCard } from '../../components/RepoCard';
import { Gem, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hidden Gems — quality repos that never trend | RepoPicks',
  description:
    'High-quality open-source repositories the trending algorithms missed. Small star counts, real momentum, verified organic growth.',
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
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 p-6 bg-[#11131F] border border-purple-400/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-xs uppercase tracking-wider">
            <Gem className="h-4 w-4 text-purple-400" />
            Quality repos that never trend
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mt-2">
            Hidden Gems
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
            Great repositories the trending algorithms missed — small star counts,
            real momentum, verified organic growth. Each one earned its place on
            velocity and community signals alone. Updated automatically, every day.
          </p>
        </div>

        <div className="space-y-3">
          {gemRepos.length === 0 ? (
            <div className="text-center py-16 bg-[#11131F] border border-white/10 rounded-xl">
              <p className="text-slate-400 font-mono text-sm">
                No hidden gems right now — the radar is scanning. Check back soon.
              </p>
            </div>
          ) : (
            gemRepos.map((repo, idx) => {
              // "Why it matters": first sentence of the maintainer's own description.
              const firstSentence = (repo.description || '')
                .split(/(?<=[.!?])\s+/)[0]
                .trim();
              const whyItMatters =
                firstSentence.length > 160 ? firstSentence.slice(0, 157) + '…' : firstSentence;
              return (
                <div key={repo.id}>
                  {whyItMatters && (
                    <p className="flex items-start gap-1.5 text-xs font-sans text-purple-300/90 mb-1.5 ml-1">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-purple-400" />
                      <span>
                        <span className="font-bold">Why it matters: </span>
                        {whyItMatters}
                      </span>
                    </p>
                  )}
                  <RepoCard repo={repo} rank={idx + 1} timeWindow="today" />
                </div>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
