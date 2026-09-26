import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Metadata } from 'next';
import { TrendingDataset } from '../../../../scripts/run-trend-etl';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { RepoCard } from '../../../components/RepoCard';
import { isAiRepo, AI_TOPICS } from '../../../lib/ai-filter';
import { Leaf, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trending without AI — non-AI open-source repos | RepoPicks',
  description:
    'Trending GitHub repositories with AI/ML projects filtered out. For developers who want the rest of open source. Ranked by star momentum, updated automatically.',
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

export default function WithoutAiPage() {
  const data = getTrendingData();
  const all = data.repositories.filter((r) => r.anomalyStatus !== 'ANOMALOUS SIGNAL');
  const filtered = all
    .filter((r) => !isAiRepo(r))
    .sort((a, b) => b.velocityScore - a.velocityScore);
  const removed = all.length - filtered.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#16DC76] mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to full trending
        </Link>

        <div className="mb-8 p-6 bg-[#131313] border border-emerald-400/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-xs uppercase tracking-wider">
            <Leaf className="h-4 w-4 text-emerald-400" />
            AI/ML filtered out · heuristic
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mt-2">
            Trending, minus the AI noise
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
            {removed > 0 ? (
              <>{removed} AI/ML {removed === 1 ? 'repository' : 'repositories'} filtered out of today&apos;s feed. </>
            ) : null}
            The rest of open source — dev tools, frameworks, databases, CLIs — ranked by the same
            star-momentum algorithm. Filtered automatically by topic heuristic, refreshed every 6 hours.
          </p>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#131313] border border-white/10 rounded-xl">
              <p className="text-slate-400 font-mono text-sm">
                Everything trending right now is AI-related. The robots win today.
              </p>
            </div>
          ) : (
            filtered.map((repo, idx) => (
              <RepoCard key={repo.id} repo={repo} rank={idx + 1} timeWindow="today" />
            ))
          )}
        </div>

        <p className="text-[11px] font-mono text-slate-600 mt-8 max-w-3xl leading-relaxed">
          Filtering heuristic: repositories carrying any of {AI_TOPICS.length} AI/ML topics
          (ai, machine-learning, llm, deep-learning, generative-ai, transformers, …) or matching
          AI keywords in name/description are excluded. Full topic list lives in src/lib/ai-filter.ts.
          False positives are possible — the filter is automatic, not editorial.
        </p>
      </main>
      <Footer />
    </div>
  );
}
