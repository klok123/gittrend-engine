import React from 'react';
import { Star, GitFork, ArrowUp, AlertCircle } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

interface RepoCardProps {
  repo: NormalizedTrendingRepo;
  rank: number;
  timeWindow?: 'today' | 'week' | 'month';
}

export function RepoCard({ repo, rank, timeWindow = 'today' }: RepoCardProps) {
  const isTopThree = rank <= 3;
  const isNumberOne = rank === 1;

  let deltaDisplay = `+${repo.starsGainedToday} today`;
  if (timeWindow === 'week') deltaDisplay = `+${repo.starsGainedWeek} this week`;
  if (timeWindow === 'month') deltaDisplay = `+${repo.starsGainedMonth} this month`;

  const formattedStars = repo.totalStars >= 1000
    ? `${(repo.totalStars / 1000).toFixed(1)}k`
    : repo.totalStars.toString();

  const formattedForks = repo.forksCount >= 1000
    ? `${(repo.forksCount / 1000).toFixed(1)}k`
    : repo.forksCount.toString();

  return (
    <div
      className={`group relative flex flex-col sm:flex-row bg-white border-2 border-black rounded-md overflow-hidden transition-all duration-150 ${
        isNumberOne
          ? 'shadow-[3px_3px_0_0_#FF7905] hover:shadow-[5px_5px_0_0_#FF7905] hover:-translate-y-0.5'
          : 'shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5'
      }`}
    >
      {/* Left / Avatar Section */}
      <div className="flex sm:flex-col items-center justify-center p-4 sm:pl-5 sm:pr-3 shrink-0 bg-slate-50/50 sm:bg-transparent border-b sm:border-b-0 sm:border-r border-slate-100">
        <img
          src={`https://github.com/${repo.owner}.png?size=112`}
          alt={`${repo.owner} avatar`}
          width={52}
          height={52}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="rounded-full bg-slate-100 border border-slate-300 h-12 w-12 object-cover"
        />
        <span className="sm:hidden ml-3 font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
          #{rank}
        </span>
      </div>

      {/* Main Details Section */}
      <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-black ${
                isNumberOne
                  ? 'bg-[#FF7905] text-black font-mono'
                  : isTopThree
                  ? 'bg-amber-300 text-black font-mono'
                  : 'bg-slate-100 text-slate-700 font-mono'
              }`}
            >
              #{rank} {isNumberOne ? 'TRENDING' : ''}
            </span>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-900 group-hover:text-[#FF7905] transition-colors break-words text-base sm:text-lg font-mono"
            >
              {repo.owner}
              <span className="text-slate-400 font-normal">/</span>
              <span className="font-extrabold text-black">{repo.name}</span>
            </a>

            {/* Language indicator */}
            <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium ml-auto sm:ml-0">
              <span
                className="h-2.5 w-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: repo.languageColor || '#888' }}
              />
              {repo.language}
            </span>

            {/* Badges: Rising or Gem */}
            {repo.isRising && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-black px-1.5 py-0.5 rounded">
                ⚡ RISING
              </span>
            )}
            {repo.isHiddenGem && (
              <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-black px-1.5 py-0.5 rounded">
                💎 GEM
              </span>
            )}
            {repo.anomalyStatus === 'ANOMALOUS SIGNAL' && (
              <span
                className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-400 px-1.5 py-0.5 rounded flex items-center gap-1"
                title={`Flagged as anomalous: ${repo.anomalyFlags.join(', ')}`}
              >
                <AlertCircle className="h-3 w-3 text-rose-600" /> Anomalous Surge
              </span>
            )}
            {repo.anomalyStatus === 'REVIEW' && (
              <span
                className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1"
                title="Recent star surge is currently under verification"
              >
                <AlertCircle className="h-3 w-3" /> Under Review
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-2">
            {repo.description}
          </p>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                >
                  <span className="text-slate-400">◇</span>
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            {/* Stars */}
            <span className="flex items-center gap-1 font-bold text-slate-900 font-mono">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
              {formattedStars}
            </span>

            {/* Forks */}
            <span className="flex items-center gap-1 text-slate-500 font-mono">
              <GitFork className="h-3.5 w-3.5 text-slate-400" />
              {formattedForks}
            </span>

            {/* Velocity Delta */}
            <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs font-mono">
              <ArrowUp className="h-3.5 w-3.5" />
              {deltaDisplay}
            </span>
          </div>

          {/* Sparkline */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">7D Trend</span>
            <Sparkline data={repo.sparkline} color={isNumberOne ? '#FF7905' : '#10b981'} width={80} height={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
