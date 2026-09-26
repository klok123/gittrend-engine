import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Rocket, Star } from 'lucide-react';
import { TrendingDataset } from '../../scripts/run-trend-etl';

type CommunityRepo = TrendingDataset['repositories'][number];

interface CommunityPicksProps {
  picks: CommunityRepo[];
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${n}`;
}

/**
 * "Community Picks" — repositories submitted by maintainers via /submit,
 * verified by the pipeline and cleared by the anomaly gate.
 * Renders nothing when there are no community submissions yet.
 * Explicitly labeled as submitted, never mixed into organic rankings.
 */
export function CommunityPicks({ picks }: CommunityPicksProps) {
  if (!picks || picks.length === 0) return null;

  return (
    <section
      aria-label="Community Picks"
      className="mb-10 rounded-xl border border-emerald-400/25 bg-[#11131F] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-400 text-black">
            <Rocket className="h-4 w-4 stroke-[2.5]" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight leading-none">
              Community Picks
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Submitted by maintainers · passed automatic quality gates · not ranked as organic trending
            </p>
          </div>
        </div>
        <Link
          href="/submit"
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
        >
          Submit your project →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {picks.map((pick) => (
          <article
            key={pick.fullName}
            className="flex flex-col rounded-lg border border-white/10 bg-[#090A0F] p-4 transition-all duration-150 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
          >
            <span className="self-start mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2 py-0.5">
              Submitted
            </span>
            <Link
              href={`/repo/${pick.owner}/${pick.name}`}
              className="group flex items-center gap-1.5 mb-2"
            >
              <span className="font-mono font-bold text-sm text-white group-hover:text-emerald-400 transition-colors break-all">
                {pick.fullName}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">
              {pick.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                {formatStars(pick.totalStars)}
              </span>
              {pick.language && pick.language !== 'Unknown' && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: pick.languageColor || '#9E9E9E' }}
                  />
                  {pick.language}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
