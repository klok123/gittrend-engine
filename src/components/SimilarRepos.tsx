import React from 'react';
import Link from 'next/link';
import { Star, ArrowUp, GitCompareArrows, Shuffle } from 'lucide-react';
import { findSimilarRepos, findAlternatives, findLanguagePeers, SimilarRepo } from '../lib/similar';
import type { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

interface SimilarReposProps {
  current: NormalizedTrendingRepo;
  all: NormalizedTrendingRepo[];
}

function MiniRow({ item, rank }: { item: SimilarRepo; rank: number }) {
  const { repo, sharedTopics } = item;
  return (
    <Link
      href={`/repo/${repo.owner}/${repo.name}`}
      className="flex items-start gap-3 p-3 rounded-lg bg-[#1B1B1B] border border-white/5 hover:border-[#16DC76]/40 hover:bg-[#1d2033] transition-all group"
    >
      <span className="font-mono text-[10px] font-bold text-slate-500 mt-0.5 w-5 shrink-0">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm font-bold text-white group-hover:text-[#16DC76] transition-colors truncate">
          {repo.owner}
          <span className="text-slate-500 font-normal"> / </span>
          {repo.name}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">
          {repo.description || 'No description provided.'}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Star className="h-3 w-3 text-[#16DC76]" />
            {repo.totalStars.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ArrowUp className="h-3 w-3" />+{repo.starsGainedToday}
          </span>
          {sharedTopics.length > 0 && (
            <span className="truncate text-slate-500">#{sharedTopics.slice(0, 3).join(' #')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * "Similar repos" + "Open-source alternatives" sections for the repo dossier page.
 * Purely algorithmic (shared topics + language + star-magnitude) — see
 * src/lib/similar.ts for the documented heuristic. Labeled honestly in the UI.
 */
export function SimilarRepos({ current, all }: SimilarReposProps) {
  const similar = findSimilarRepos(current, all, 6);
  const alternatives = findAlternatives(current, all, 6).filter(
    (a) => !similar.some((s) => s.repo.id === a.repo.id)
  );
  // Fallback: repos without topic data still get a useful (weaker) section.
  const peers = similar.length === 0 ? findLanguagePeers(current, all, 6) : [];

  if (similar.length === 0 && alternatives.length === 0 && peers.length === 0) {
    return null;
  }

  return (
    <section aria-label="Similar repositories" className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {similar.length > 0 && (
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <GitCompareArrows className="h-4 w-4 text-[#16DC76]" />
              <h3 className="font-mono font-bold text-base text-white">Similar repos</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mb-4">
              Same language, shared topics — ranked algorithmically, not endorsements.
            </p>
            <div className="space-y-2">
              {similar.map((item, i) => (
                <MiniRow key={item.repo.id} item={item} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {similar.length === 0 && peers.length > 0 && (
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <GitCompareArrows className="h-4 w-4 text-[#16DC76]" />
              <h3 className="font-mono font-bold text-base text-white">
                More in {current.language}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mb-4">
              This repo has no topic data — showing same-language repos of similar
              size instead. Weaker signal, labeled honestly.
            </p>
            <div className="space-y-2">
              {peers.map((item, i) => (
                <MiniRow key={item.repo.id} item={item} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {alternatives.length > 0 && (
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <Shuffle className="h-4 w-4 text-sky-400" />
              <h3 className="font-mono font-bold text-base text-white">Open-source alternatives</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mb-4">
              Different projects solving similar problems — based on shared topics.
            </p>
            <div className="space-y-2">
              {alternatives.map((item, i) => (
                <MiniRow key={item.repo.id} item={item} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
