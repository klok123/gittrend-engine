import React from 'react';
import { ArrowUpRight, Flame, Star } from 'lucide-react';

export interface DailyPick {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  topics: string[];
  language: string;
  totalStars: number;
  starsGainedToday: number;
}

interface PicksOfTheDayProps {
  picks: DailyPick[];
  updated?: string;
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${n}`;
}

/**
 * "Picks of the Day" — top repos by stars gained today, selected automatically
 * by the trend-etl pipeline (scripts/generate-picks.ts). Zero manual input:
 * data comes from public/data/picks.json, regenerated on every data refresh.
 * Renders nothing when the picks list is empty.
 */
export function PicksOfTheDay({ picks, updated }: PicksOfTheDayProps) {
  if (!picks || picks.length === 0) return null;

  return (
    <section
      aria-label="Picks of the Day"
      className="mb-10 rounded-xl border border-[#16DC76]/25 bg-[#131313] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#16DC76] text-black">
            <Flame className="h-4 w-4 stroke-[2.5]" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight leading-none">
              Picks of the Day
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Top movers by stars gained today · auto-refreshed
              {updated ? ` · ${updated.slice(0, 10)}` : ''}
            </p>
          </div>
        </div>
        <a
          href="https://www.instagram.com/repopicks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-slate-400 hover:text-[#16DC76] transition-colors"
        >
          Daily picks on Instagram →
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {picks.map((pick) => (
          <article
            key={pick.fullName}
            className="flex flex-col rounded-lg border border-white/10 bg-[#0A0A0A] p-4 transition-all duration-150 hover:-translate-y-1 hover:border-[#16DC76]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
          >
            <a
              href={pick.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 mb-2"
            >
              <span className="font-mono font-bold text-sm text-white group-hover:text-[#16DC76] transition-colors break-all">
                {pick.fullName}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-[#16DC76] transition-colors" />
            </a>
            <p className="text-sm text-slate-300 leading-relaxed font-sans flex-1">
              {pick.description}
            </p>
            {pick.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pick.topics.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs font-mono border-t border-white/5 pt-3">
              <span className="flex items-center gap-1 text-emerald-300">
                <Flame className="h-3.5 w-3.5 text-[#16DC76]" />+
                {pick.starsGainedToday.toLocaleString('en-US')} today
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Star className="h-3.5 w-3.5" />
                {formatStars(pick.totalStars)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
