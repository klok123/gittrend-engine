'use client';

import React from 'react';
import Link from 'next/link';
import { Star, GitFork, ArrowUp, AlertCircle, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { HealthDot } from './HealthDot';
import { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';
import { calculateOrganicTrustScore } from '../engine/repo-intelligence';

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

  // Compute organic trust grade
  const trust = calculateOrganicTrustScore(repo);

  const gradeBadgeStyles = {
    'A+': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'A': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'B': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'C': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'F': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[trust.grade];

  return (
    <div
      className={`group relative flex flex-col sm:flex-row bg-[#131313] border rounded-xl overflow-hidden transition-all duration-150 ${
        isNumberOne
          ? 'border-[#16DC76]/50 shadow-[0_4px_24px_rgba(22,220,118,0.12)] hover:border-[#16DC76] hover:shadow-[0_8px_32px_rgba(22,220,118,0.22)] hover:-translate-y-0.5'
          : isTopThree
          ? 'border-amber-400/30 hover:border-amber-400/60 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
          : 'border-white/10 hover:border-white/20 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Left / Avatar Section */}
      <div className="flex sm:flex-col items-center justify-center p-4 sm:pl-5 sm:pr-3 shrink-0 bg-white/[0.02] sm:bg-transparent border-b sm:border-b-0 sm:border-r border-white/5">
        <img
          src={`https://github.com/${repo.owner}.png?size=112`}
          alt={`${repo.owner} avatar`}
          width={50}
          height={50}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="rounded-full bg-slate-900 border border-white/10 h-12 w-12 object-cover"
        />
        <span className="sm:hidden ml-3 font-mono font-bold text-xs bg-white/10 text-white px-2 py-0.5 rounded border border-white/10">
          #{rank}
        </span>
      </div>

      {/* Main Details Section */}
      <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border font-mono ${
                isNumberOne
                  ? 'bg-[#16DC76] text-black border-[#16DC76]'
                  : isTopThree
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-white/5 text-slate-300 border-white/10'
              }`}
            >
              #{rank} {isNumberOne ? 'TRENDING' : ''}
            </span>

            <Link
              href={`/repo/${repo.owner}/${repo.name}`}
              className="font-bold text-white group-hover:text-[#16DC76] transition-colors break-words text-base sm:text-lg font-mono tracking-tight"
            >
              {repo.owner}
              <span className="text-slate-500 font-normal"> / </span>
              <span className="font-extrabold text-white">{repo.name}</span>
            </Link>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open directly on GitHub"
              className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Language indicator */}
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium ml-auto sm:ml-0 font-mono">
              <span
                className="h-2 w-2 rounded-full border border-black/40"
                style={{ backgroundColor: repo.languageColor || '#888' }}
              />
              {repo.language}
            </span>

            {/* Trust Grade Badge (the "Legit score" — automated organic-growth estimate) */}
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${gradeBadgeStyles}`}
              title={`Legit score: ${trust.score}/100 — automated estimate of organic star growth. Unusual patterns are flagged for review, never treated as proof of wrongdoing. ${trust.summary}`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span>GRADE {trust.grade}</span>
            </span>

            {/* Maintenance health dot */}
            <HealthDot repo={repo} />

            {/* Badges: Rising or Gem */}
            {repo.isRising && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                ⚡ RISING
              </span>
            )}
            {repo.isHiddenGem && (
              <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                💎 GEM
              </span>
            )}
            {repo.anomalyStatus === 'ANOMALOUS SIGNAL' && (
              <span
                className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded flex items-center gap-1"
                title={`Unusual star activity detected (${repo.anomalyFlags.join(', ')}). This is an automated statistical signal under review — not an accusation of wrongdoing.`}
              >
                <AlertCircle className="h-3 w-3 text-rose-400" /> Unusual activity
              </span>
            )}
            {repo.anomalyStatus === 'REVIEW' && (
              <span
                className="text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1"
                title="Recent star surge is under verification. Automated signal — not an accusation."
              >
                <AlertCircle className="h-3 w-3" /> Under Review
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-300 mt-2 text-sm leading-relaxed line-clamp-2 font-sans">
            {repo.description}
          </p>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-[#1B1B1B] border border-white/5 px-2 py-0.5 rounded"
                >
                  <span className="text-slate-500">#</span>
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-white/5 flex-wrap">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 flex-wrap font-mono">
            {/* Stars */}
            <span className="flex items-center gap-1 font-bold text-white tabular-nums">
              <Star className="h-4 w-4 text-[#16DC76] fill-[#16DC76]" />
              {formattedStars}
            </span>

            {/* Forks */}
            <span className="flex items-center gap-1 text-slate-400 tabular-nums">
              <GitFork className="h-3.5 w-3.5 text-slate-500" />
              {formattedForks}
            </span>

            {/* Velocity Delta */}
            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs tabular-nums">
              <ArrowUp className="h-3.5 w-3.5" />
              {deltaDisplay}
            </span>
          </div>

          {/* Sparkline & Dossier Link */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">7D Trend</span>
              <Sparkline data={repo.sparkline} color={isNumberOne ? '#16DC76' : '#10b981'} width={80} height={24} />
            </div>

            <Link
              href={`/repo/${repo.owner}/${repo.name}`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white hover:text-black bg-[#1B1B1B] hover:bg-[#16DC76] px-2.5 py-1 rounded-md border border-white/10 hover:border-[#16DC76] transition-all cursor-pointer"
            >
              <span>Dossier</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
