import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from  '../../../../../components/Header';
import { Footer } from  '../../../../../components/Footer';
import { RepoCard } from  '../../../../../components/RepoCard';
import { listArchiveDates, readArchiveDay } from  '../../../../../lib/archive';
import { Archive, ArrowLeft } from 'lucide-react';

export const revalidate = 3600;

export async function generateStaticParams() {
  return listArchiveDates().map((dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return { year, month, day };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string; day: string }>;
}): Promise<Metadata> {
  const { year, month, day } = await params;
  const dateStr = `${year}-${month}-${day}`;
  return {
    title: `Trending GitHub repos on ${dateStr} | RepoPicks Archive`,
    description: `Daily snapshot of trending GitHub repositories from ${dateStr}, ranked by star momentum. RepoPicks archive.`,
  };
}

export default async function ArchiveDayPage({
  params,
}: {
  params: Promise<{ year: string; month: string; day: string }>;
}) {
  const { year, month, day } = await params;
  const dateStr = `${year}-${month}-${day}`;
  const file = readArchiveDay(dateStr);
  if (!file) notFound();

  const repos = [...file.repositories]
    .filter((r) => r.anomalyStatus !== 'ANOMALOUS SIGNAL')
    .sort((a, b) => b.starsGainedToday - a.starsGainedToday);

  const pretty = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString(
    'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#FF7905] mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All snapshots
        </Link>

        <div className="mb-8 p-6 bg-[#11131F] border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-slate-300 font-bold font-mono text-xs uppercase tracking-wider">
            <Archive className="h-4 w-4 text-[#FF7905]" />
            Daily snapshot ·{' '}
            {file.dataSource === 'DB_BACKFILL'
              ? 'reconstructed from velocity history'
              : file.dataSource === 'DETERMINISTIC_DEVELOPMENT_BASELINE'
                ? 'sample data'
                : 'captured live'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mt-2">
            {pretty}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
            The {repos.length} repositories with the strongest star momentum on this day —
            exactly as the radar saw them. History, not hindsight.
          </p>
        </div>

        <div className="space-y-3">
          {repos.map((repo, idx) => (
            <RepoCard key={repo.id} repo={repo} rank={idx + 1} timeWindow="today" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
