import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  GitFork,
  ArrowUp,
  AlertCircle,
  Clock,
  Activity,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { Header } from '../../../../components/Header';
import { Footer } from '../../../../components/Footer';
import { TrajectoryChart } from '../../../../components/TrajectoryChart';
import { TrustScoreGauge } from '../../../../components/TrustScoreGauge';
import { BadgeModal } from '../../../../components/BadgeModal';
import { SimilarRepos } from '../../../../components/SimilarRepos';
import {
  calculateOrganicTrustScore,
  calculateGrowthAcceleration,
  calculateMaintenanceVitality,
} from '../../../../engine/repo-intelligence';
import { TrendingDataset, NormalizedTrendingRepo } from '../../../../../scripts/run-trend-etl';

export const revalidate = 3600;

interface RepoPageProps {
  params: Promise<{ owner: string; name: string }>;
}

function getDataset(): TrendingDataset {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.error('[REPO_DOSSIER_LOAD_ERROR] Failed to read dataset:', err);
  }
  return {
    updatedAt: new Date().toISOString(),
    totalRepos: 0,
    repositories: [],
    languages: [],
    risingCount: 0,
    hiddenGemsCount: 0,
    anomalousCount: 0,
  };
}

function findRepo(
  dataset: TrendingDataset,
  owner: string,
  name: string
): { repo: NormalizedTrendingRepo; rank: number } | null {
  const target = `${owner}/${name}`.toLowerCase();
  const idx = dataset.repositories.findIndex((r) => r.fullName.toLowerCase() === target);
  if (idx === -1) return null;
  return { repo: dataset.repositories[idx], rank: idx + 1 };
}

// Pre-render top 100 repositories at build time for 0ms edge response
export async function generateStaticParams() {
  const dataset = getDataset();
  return dataset.repositories.slice(0, 100).map((r) => ({
    owner: r.owner,
    name: r.name,
  }));
}

export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  const { owner, name } = await params;
  const match = findRepo(getDataset(), owner, name);
  if (!match) {
    return {
      title: `${owner}/${name} | RepoPicks Dossier`,
      description: `Intelligence dossier and star momentum analysis for ${owner}/${name}.`,
    };
  }

  const { repo, rank } = match;
  const title = `${repo.fullName} (#${rank}) - Star Velocity & Growth Dossier | RepoPicks`;
  const description = `${repo.fullName} intelligence report: ${repo.totalStars.toLocaleString()} stars (+${repo.starsGainedToday} today), Organic Trust Score, momentum trajectory, and open-source maintenance audit.`;

  return {
    title,
    description,
    keywords: [
      repo.fullName,
      repo.name,
      repo.owner,
      repo.language || 'software',
      'github analytics',
      'star velocity',
      'trend intelligence',
      'anti-fraud audit',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://clever-volta-lac.vercel.app/repo/${repo.owner}/${repo.name}`,
    },
  };
}

export default async function RepoDossierPage({ params }: RepoPageProps) {
  const { owner, name } = await params;
  const dataset = getDataset();
  const match = findRepo(dataset, owner, name);

  if (!match) {
    notFound();
  }

  const { repo, rank } = match;

  // Run algorithmic intelligence models
  const trust = calculateOrganicTrustScore(repo);
  const accel = calculateGrowthAcceleration(repo);
  const vitality = calculateMaintenanceVitality(repo);

  const formattedStars = repo.totalStars.toLocaleString();
  const formattedForks = repo.forksCount.toLocaleString();

  // JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: repo.name,
    codeRepository: repo.url,
    programmingLanguage: repo.language,
    author: {
      '@type': 'Organization',
      name: repo.owner,
    },
    description: repo.description,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: repo.totalStars,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-slate-100 font-sans selection:bg-[#16DC76]/30 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Trending Repositories</span>
          </Link>

          <div className="flex items-center gap-2">
            <BadgeModal owner={repo.owner} name={repo.name} />
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B1B1B] hover:bg-[#202338] text-white border border-white/10 rounded-md font-mono text-xs font-semibold shadow-xs hover:border-white/20 active:translate-y-0.5 transition-all"
            >
              <span>View on GitHub</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#16DC76]" />
            </a>
          </div>
        </div>

        {/* Hero Dossier Card */}
        <div className="bg-[#131313] border border-white/10 rounded-xl p-6 sm:p-8 mb-8 backdrop-blur-sm relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#16DC76]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <img
              src={`https://github.com/${repo.owner}.png?size=160`}
              alt={`${repo.owner} avatar`}
              width={72}
              height={72}
              className="rounded-full bg-[#1B1B1B] border border-white/15 h-16 w-16 sm:h-20 sm:w-20 object-cover shrink-0 ring-2 ring-white/5"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#16DC76]/30 bg-[#16DC76]/10 text-[#16DC76]">
                  RANK #{rank}
                </span>

                {repo.isRising && (
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    ⚡ RISING STAR
                  </span>
                )}

                {repo.isHiddenGem && (
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">
                    💎 HIDDEN GEM
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-300 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/10">
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/20"
                    style={{ backgroundColor: repo.languageColor || '#888' }}
                  />
                  {repo.language || 'General'}
                </span>
              </div>

              <h1 className="font-mono font-extrabold text-2xl sm:text-3xl text-white break-words tracking-tight">
                <span className="text-slate-400 font-normal">{repo.owner} / </span>
                <span>{repo.name}</span>
              </h1>

              <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
                {repo.description || 'No description provided by maintainer.'}
              </p>

              {/* Topics Pills */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-white/[0.06]">
                  {repo.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[11px] px-2.5 py-0.5 bg-white/[0.04] text-slate-400 rounded-md border border-white/10 hover:text-slate-200 transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4-Card Vitality Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Star Momentum */}
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Star Velocity</span>
              <Star className="h-4 w-4 text-[#16DC76]" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{formattedStars}</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 tabular-nums">
                +{repo.starsGainedToday} today
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 mt-3 pt-2.5 border-t border-white/[0.06] flex justify-between">
              <span>Weekly: +{repo.starsGainedWeek}</span>
              <span className={`font-bold ${accel.status === 'ACCELERATING' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {accel.status}
              </span>
            </div>
          </div>

          {/* Card 2: Organic Trust */}
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Organic Trust</span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{trust.score}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">
                GRADE {trust.grade}
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 mt-3 pt-2.5 border-t border-white/[0.06]">
              Status: <span className="font-semibold text-slate-200">{trust.anomalyStatus}</span>
            </div>
          </div>

          {/* Card 3: Community Dispersion */}
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Fork Dispersion</span>
              <GitFork className="h-4 w-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{formattedForks}</span>
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 tabular-nums">
                {trust.forkRatioPercent}% ratio
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 mt-3 pt-2.5 border-t border-white/[0.06] flex justify-between">
              <span>Open Issues: {repo.openIssuesCount}</span>
              <span>{vitality.issueRatioPercent}% ratio</span>
            </div>
          </div>

          {/* Card 4: Maintenance Cadence */}
          <div className="bg-[#131313] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Vitality Cadence</span>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl sm:text-2xl font-extrabold text-white">{vitality.cadence}</span>
            </div>
            <div className="font-mono text-xs text-slate-400 mt-3 pt-2.5 border-t border-white/[0.06] flex justify-between">
              <span>Pushed {vitality.daysSinceLastPush}d ago</span>
              <span className="font-bold text-slate-300">{vitality.maturityStage}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Deep Intelligence Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left / Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            <TrajectoryChart data={repo.sparkline} repoName={repo.name} />
            <TrustScoreGauge trust={trust} />
          </div>

          {/* Right / Breakdown Column (1 span) */}
          <div className="space-y-6">
            {/* Algorithmic Scoring Specs */}
            <div className="bg-[#131313] border border-white/10 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-[#16DC76]" />
                <h3 className="font-mono font-bold text-base text-white">Algorithmic Breakdown</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Velocity Score:</span>
                  <span className="font-bold text-white tabular-nums">{repo.velocityScore} pts</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Breakout Ratio:</span>
                  <span className="font-bold text-[#16DC76] tabular-nums">{repo.breakoutScore}x</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Growth Rate / Day:</span>
                  <span className="font-bold text-white tabular-nums">{accel.dailyRate} stars</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">7-Day Trailing Avg:</span>
                  <span className="font-bold text-white tabular-nums">{accel.weeklyAvgDailyRate} stars / day</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Growth Acceleration:</span>
                  <span className={`font-bold tabular-nums ${accel.acceleration >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {accel.acceleration >= 0 ? `+${accel.acceleration}` : accel.acceleration} stars
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Repository Age:</span>
                  <span className="font-bold text-white tabular-nums">{vitality.ageDays} days</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#16DC76] hover:text-[#16DC76] hover:underline transition-colors"
                >
                  <span>Read ranking mathematical models</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Quick Readme Embed Card */}
            <div className="bg-[#1B1B1B] text-white border border-white/10 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-[#16DC76]" />
                <h3 className="font-mono font-bold text-sm text-white">Embed in README</h3>
              </div>
              <p className="text-xs text-slate-400 font-sans mb-3 leading-relaxed">
                Show off your live ranking and star velocity directly on GitHub.
              </p>
              <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10 mb-3 flex justify-center">
                <img
                  src={`https://clever-volta-lac.vercel.app/api/badge/${repo.owner}/${repo.name}`}
                  alt="GitTrend Badge"
                  className="h-5"
                />
              </div>
              <BadgeModal owner={repo.owner} name={repo.name} />
            </div>
          </div>
        </div>
        {/* Similar repos & open-source alternatives (algorithmic, topic-based) */}
        <SimilarRepos current={repo} all={dataset.repositories} />
      </main>

      <Footer />
    </div>
  );
}
