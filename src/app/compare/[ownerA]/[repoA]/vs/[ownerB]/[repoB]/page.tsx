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
  ChevronLeft,
  GitCompareArrows,
  Trophy,
  Minus,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../../../../../../components/Header';
import { Footer } from '../../../../../../../components/Footer';
import {
  calculateOrganicTrustScore,
  calculateMaintenanceVitality,
} from '../../../../../../../engine/repo-intelligence';
import { findAlternatives } from '../../../../../../../lib/similar';
import type {
  TrendingDataset,
  NormalizedTrendingRepo,
} from '../../../../../../../../scripts/run-trend-etl';

export const revalidate = 3600;

interface ComparePageProps {
  params: Promise<{
    ownerA: string;
    repoA: string;
    ownerB: string;
    repoB: string;
  }>;
}

function getDataset(): TrendingDataset {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.error('[COMPARE_LOAD_ERROR] Failed to read dataset:', err);
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

/** Laya quick-take verdicts, pre-computed at ETL time. Absent = section hidden. */
interface LayaVerdict {
  pick: 'A' | 'B' | 'tie';
  confidence: number; // 0-1
  note: string;
}
function getLayaVerdict(a: NormalizedTrendingRepo, b: NormalizedTrendingRepo): LayaVerdict | null {
  try {
    const vPath = path.join(process.cwd(), 'public', 'data', 'laya-verdicts.json');
    if (!fs.existsSync(vPath)) return null;
    const all: Record<string, LayaVerdict> = JSON.parse(fs.readFileSync(vPath, 'utf8'));
    // Keys are stored sorted ("a|b"); map the stored pick back to this page's A/B order.
    const keyA = a.fullName.toLowerCase();
    const keyB = b.fullName.toLowerCase();
    const [first] = [keyA, keyB].sort();
    const hit = all[`${first}|${keyA === first ? keyB : keyA}`];
    if (!hit) return null;
    if (hit.pick === 'tie') return hit;
    const storedIsPageA = (hit.pick === 'A') === (keyA === first);
    return { ...hit, pick: storedIsPageA ? ('A' as const) : ('B' as const) };
  } catch {
    return null;
  }
}

function findRepo(dataset: TrendingDataset, owner: string, name: string) {
  const target = `${owner}/${name}`.toLowerCase();
  return dataset.repositories.find((r: NormalizedTrendingRepo) => r.fullName.toLowerCase() === target) ?? null;
}

// Pre-render the most useful pairs: top 40 trending repos x top 2 alternatives.
export async function generateStaticParams() {
  const dataset = getDataset();
  const seen = new Set<string>();
  const params: { ownerA: string; repoA: string; ownerB: string; repoB: string }[] = [];
  for (const repo of dataset.repositories.slice(0, 40)) {
    for (const alt of findAlternatives(repo, dataset.repositories, 2)) {
      const pair = [repo.fullName.toLowerCase(), alt.repo.fullName.toLowerCase()].sort().join('|');
      if (seen.has(pair)) continue;
      seen.add(pair);
      const [first, second] = [repo, alt.repo].sort((x, y) =>
        x.fullName.toLowerCase() < y.fullName.toLowerCase() ? -1 : 1
      );
      params.push({
        ownerA: first.owner,
        repoA: first.name,
        ownerB: second.owner,
        repoB: second.name,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { ownerA, repoA, ownerB, repoB } = await params;
  const dataset = getDataset();
  const a = findRepo(dataset, ownerA, repoA);
  const b = findRepo(dataset, ownerB, repoB);
  const title =
    a && b
      ? `${a.fullName} vs ${b.fullName} — Side-by-Side Comparison | RepoPicks`
      : `Compare repositories | RepoPicks`;
  const description =
    a && b
      ? `Compare ${a.fullName} vs ${b.fullName}: stars, velocity, maintenance health and trust score side by side. Don't just use the viral one — compare.`
      : `Side-by-side open-source repository comparison on RepoPicks.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
  };
}

interface Row {
  label: string;
  a: string;
  b: string;
  winner: 'A' | 'B' | 'tie';
  hint?: string;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function timeAgo(iso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function buildRows(a: NormalizedTrendingRepo, b: NormalizedTrendingRepo): Row[] {
  const trustA = calculateOrganicTrustScore(a);
  const trustB = calculateOrganicTrustScore(b);
  const vitA = calculateMaintenanceVitality(a);
  const vitB = calculateMaintenanceVitality(b);
  const win = (x: number, y: number, higherBetter = true): Row['winner'] => {
    if (x === y) return 'tie';
    return higherBetter ? (x > y ? 'A' : 'B') : (x < y ? 'A' : 'B');
  };
  return [
    { label: 'Total stars', a: fmt(a.totalStars), b: fmt(b.totalStars), winner: win(a.totalStars, b.totalStars) },
    { label: 'Stars today', a: `+${fmt(a.starsGainedToday)}`, b: `+${fmt(b.starsGainedToday)}`, winner: win(a.starsGainedToday, b.starsGainedToday), hint: 'Momentum right now' },
    { label: 'Stars this week', a: `+${fmt(a.starsGainedWeek)}`, b: `+${fmt(b.starsGainedWeek)}`, winner: win(a.starsGainedWeek, b.starsGainedWeek) },
    { label: 'Velocity score', a: a.velocityScore.toFixed(1), b: b.velocityScore.toFixed(1), winner: win(a.velocityScore, b.velocityScore), hint: 'Our momentum model' },
    { label: 'Trust score', a: `${trustA.score} (${trustA.grade})`, b: `${trustB.score} (${trustB.grade})`, winner: win(trustA.score, trustB.score), hint: 'Organic-growth signals' },
    { label: 'Maintenance', a: vitA.cadence, b: vitB.cadence, winner: win(vitA.daysSinceLastPush, vitB.daysSinceLastPush, false), hint: `Last push ${timeAgo(a.pushedAt)} vs ${timeAgo(b.pushedAt)}` },
    { label: 'Forks', a: fmt(a.forksCount), b: fmt(b.forksCount), winner: win(a.forksCount, b.forksCount), hint: 'Community adoption' },
    { label: 'Open issues', a: fmt(a.openIssuesCount), b: fmt(b.openIssuesCount), winner: win(a.openIssuesCount, b.openIssuesCount, false), hint: 'Lower is calmer' },
    { label: 'Language', a: a.language || 'Unknown', b: b.language || 'Unknown', winner: 'tie' },
  ];
}

function RepoHead({ repo, side }: { repo: NormalizedTrendingRepo; side: 'A' | 'B' }) {
  return (
    <div className="flex-1 min-w-0">
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono font-bold text-sm mb-3 ${
          side === 'A' ? 'bg-[#FF7905]/15 text-[#FF7905]' : 'bg-sky-400/15 text-sky-400'
        }`}
      >
        {side}
      </div>
      <Link
        href={`/repo/${repo.owner}/${repo.name}`}
        className="block font-mono font-bold text-white text-lg hover:text-[#FF7905] transition-colors break-words"
      >
        {repo.owner}
        <span className="text-slate-500 font-normal"> / </span>
        {repo.name}
      </Link>
      <p className="text-sm text-slate-400 font-sans mt-1 line-clamp-2">
        {repo.description || 'No description provided.'}
      </p>
      <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-500">
        <span className="inline-flex items-center gap-1 text-slate-300">
          <Star className="h-3 w-3 text-[#FF7905]" />
          {fmt(repo.totalStars)}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <ArrowUp className="h-3 w-3" />+{fmt(repo.starsGainedToday)}
        </span>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          GitHub <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {repo.anomalyStatus !== 'NORMAL' && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
          <AlertCircle className="h-3 w-3" />
          {repo.anomalyStatus === 'ANOMALOUS SIGNAL' ? 'Anomalous growth signal' : 'Growth under review'}
        </p>
      )}
    </div>
  );
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { ownerA, repoA, ownerB, repoB } = await params;
  const dataset = getDataset();
  const a = findRepo(dataset, ownerA, repoA);
  const b = findRepo(dataset, ownerB, repoB);
  if (!a || !b) notFound();
  if (a.fullName.toLowerCase() === b.fullName.toLowerCase()) notFound();

  const rows = buildRows(a, b);
  const winsA = rows.filter((r) => r.winner === 'A').length;
  const winsB = rows.filter((r) => r.winner === 'B').length;
  const verdict = getLayaVerdict(a, b);

  return (
    <div className="min-h-screen bg-[#0B0D16] text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="h-3 w-3" /> Back to trending
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <GitCompareArrows className="h-5 w-5 text-[#FF7905]" />
          <h1 className="font-mono font-bold text-2xl">Head to head</h1>
        </div>
        <p className="text-sm text-slate-400 font-sans mb-8 max-w-2xl">
          Don&apos;t just use the viral one — compare it. Same data we track for every repo,
          side by side. Higher isn&apos;t always better; read the rows.
        </p>

        {/* Repo headers */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
          <div className="bg-[#11131F] border border-white/10 rounded-xl p-5">
            <RepoHead repo={a} side="A" />
          </div>
          <div className="hidden md:flex items-center justify-center font-mono font-bold text-slate-600 text-xl pt-8">
            VS
          </div>
          <div className="bg-[#11131F] border border-white/10 rounded-xl p-5">
            <RepoHead repo={b} side="B" />
          </div>
        </div>

        {/* By-the-numbers strip */}
        <div className="flex items-center gap-3 bg-[#11131F] border border-white/10 rounded-xl px-5 py-4 mb-8">
          <Trophy className="h-5 w-5 text-[#FF7905] shrink-0" />
          <p className="text-sm font-mono">
            By the numbers:{' '}
            <span className="text-[#FF7905] font-bold">{a.name} {winsA}</span>
            <span className="text-slate-500"> — </span>
            <span className="text-sky-400 font-bold">{winsB} {b.name}</span>
          </p>
        </div>

        {/* Laya quick take */}
        {verdict && (
          <div className="bg-gradient-to-r from-[#FF7905]/10 to-sky-400/10 border border-[#FF7905]/25 rounded-xl px-5 py-4 mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#FF7905]" />
              <h2 className="font-mono font-bold text-sm">Quick take</h2>
              <span className="text-[10px] font-mono text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
                Laya · experimental
              </span>
            </div>
            <p className="text-sm font-sans text-slate-200">
              {verdict.pick === 'tie'
                ? 'Too close to call — pick by your stack.'
                : `Leans ${verdict.pick === 'A' ? a.fullName : b.fullName} (${Math.round(verdict.confidence * 100)}% confidence).`}{' '}
              {verdict.note}
            </p>
            <p className="text-[11px] font-mono text-slate-500 mt-2">
              A fast heuristic read from the numbers above — not a review. The data wins arguments.
            </p>
          </div>
        )}

        {/* Comparison table */}
        <div className="bg-[#11131F] border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-5 py-3 border-b border-white/10 text-[11px] font-mono text-slate-500 uppercase tracking-wide">
            <span>Metric</span>
            <span className="text-[#FF7905] truncate">{a.name}</span>
            <span className="text-sky-400 truncate">{b.name}</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-5 py-3 border-b border-white/5 last:border-0 items-center"
            >
              <div>
                <p className="text-sm font-mono text-slate-300">{row.label}</p>
                {row.hint && <p className="text-[11px] font-mono text-slate-600">{row.hint}</p>}
              </div>
              <Cell value={row.a} won={row.winner === 'A'} />
              <Cell value={row.b} won={row.winner === 'B'} />
            </div>
          ))}
        </div>

        <p className="text-[11px] font-mono text-slate-600 text-center max-w-2xl mx-auto">
          Winners are marked per-row by simple rules (higher stars, lower issues). They are not
          endorsements — the right pick depends on your stack. Full dossiers:{' '}
          <Link href={`/repo/${a.owner}/${a.name}`} className="text-slate-400 hover:text-white underline">
            {a.fullName}
          </Link>
          {' · '}
          <Link href={`/repo/${b.owner}/${b.name}`} className="text-slate-400 hover:text-white underline">
            {b.fullName}
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

function Cell({ value, won }: { value: string; won: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-mono ${won ? 'text-white font-bold' : 'text-slate-400'}`}>
        {value}
      </span>
      {won ? (
        <Trophy className="h-3.5 w-3.5 text-[#FF7905] shrink-0" />
      ) : (
        <Minus className="h-3.5 w-3.5 text-slate-700 shrink-0" />
      )}
    </div>
  );
}
