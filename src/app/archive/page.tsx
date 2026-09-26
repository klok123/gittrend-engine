import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { listArchiveDates } from '../../lib/archive';
import { Archive, CalendarDays, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trending Archive — every day of open-source history | RepoPicks',
  description:
    'Browse daily snapshots of trending GitHub repositories. See what was rising on any day — automatically archived every 6 hours.',
};

export const revalidate = 3600;

function prettyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function ArchiveIndexPage() {
  const dates = listArchiveDates();

  // Group by month for a compact index
  const byMonth = new Map<string, string[]>();
  for (const dateStr of dates) {
    const key = dateStr.slice(0, 7); // YYYY-MM
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(dateStr);
  }
  const monthKeys = [...byMonth.keys()].sort().reverse();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-[1560px] px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 p-6 bg-[#131313] border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-slate-300 font-bold font-mono text-xs uppercase tracking-wider">
            <Archive className="h-4 w-4 text-[#16DC76]" />
            Daily snapshots
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mt-2">
            Trending Archive
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans leading-relaxed">
            GitHub only shows today&apos;s trending — and forgets yesterday. We keep every day.
            Pick a date to see exactly which repositories were rising, automatically snapshotted
            every 6 hours. No manual curation, just history.
          </p>
        </div>

        {dates.length === 0 ? (
          <div className="text-center py-16 bg-[#131313] border border-white/10 rounded-xl">
            <p className="text-slate-400 font-mono text-sm">
              The archive is still warming up — the first snapshot lands after the next data refresh.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {monthKeys.map((monthKey) => {
              const [y, m] = monthKey.split('-').map(Number);
              const monthLabel = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              });
              return (
                <section key={monthKey}>
                  <h2 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#16DC76]" />
                    {monthLabel}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {byMonth.get(monthKey)!.map((dateStr) => {
                      const [yy, mm, dd] = dateStr.split('-');
                      return (
                        <Link
                          key={dateStr}
                          href={`/archive/${yy}/${mm}/${dd}`}
                          className="group bg-[#131313] border border-white/10 hover:border-[#16DC76]/40 rounded-xl p-4 transition-all duration-150"
                        >
                          <div className="text-lg font-mono font-extrabold text-white group-hover:text-[#16DC76]">
                            {prettyDate(dateStr).split(',')[0]}
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            {dateStr}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-[#16DC76]">
                            View snapshot <ArrowRight className="h-3 w-3" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
