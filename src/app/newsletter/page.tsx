import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Metadata } from 'next';
import { Mail, ArrowUpRight, Rocket, Zap, Gem, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { NEWSLETTER_URL, INSTAGRAM_URL, SITE_URL } from '../../siteConfig';
import { TrendingDataset } from '../../../scripts/run-trend-etl';

export const metadata: Metadata = {
  title: 'Newsletter — 5 best repos every week | RepoPicks',
  description:
    'One short email every Monday: the 5 fastest-rising open-source repos, breakout radar, and a hidden gem. Free, no spam, unsubscribe anytime.',
  openGraph: {
    title: 'The RepoPicks Weekly',
    description: '5 best repos every week, in one short email.',
    url: `${SITE_URL}/newsletter`,
  },
};

export const revalidate = 3600;

function getDataset(): TrendingDataset {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.error('[NEWSLETTER_LOAD_ERROR]', err);
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

const WHAT_YOU_GET = [
  {
    icon: Rocket,
    color: 'text-[#16DC76]',
    title: 'Top 5 rising repos',
    text: 'The fastest-moving open-source projects of the week, ranked by star velocity — not all-time fame.',
  },
  {
    icon: Zap,
    color: 'text-amber-300',
    title: 'Breakout radar',
    text: 'Repos caught early, before they go viral. The same radar that powers our /breakouts page.',
  },
  {
    icon: Gem,
    color: 'text-purple-300',
    title: 'Hidden gem of the week',
    text: 'One high-quality repo the algorithms missed — small stars, real momentum.',
  },
];

export default function NewsletterPage() {
  const dataset = getDataset();
  const sample = [...dataset.repositories]
    .filter((r) => r.anomalyStatus === 'NORMAL')
    .sort((a, b) => b.velocityScore - a.velocityScore)
    .slice(0, 5);
  const ready = NEWSLETTER_URL.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-slate-100 font-sans">
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 sm:px-6 py-10 sm:py-14 flex-1 w-full">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#16DC76] text-black shadow-[0_0_25px_rgba(22,220,118,0.4)]">
            <Mail className="h-6 w-6 stroke-[2.5]" />
          </div>
          <p className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-3">
            The RepoPicks Weekly
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-mono leading-tight">
            5 best repos,
            <br />
            <span className="text-[#16DC76]">every Monday.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
            One short email. The most useful open-source finds of the week —
            rising stars, early breakouts, and a hidden gem. Free forever.
          </p>

          <div className="mt-7">
            {ready ? (
              <a
                href={NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#16DC76] px-8 py-3 text-sm font-mono font-bold text-black hover:bg-[#1FE084] active:scale-95 transition-all"
              >
                Subscribe free
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <div className="inline-block rounded-xl border border-white/10 bg-[#131313] px-6 py-4">
                <p className="text-sm font-mono text-slate-300">
                  The newsletter launches soon.
                </p>
                <p className="mt-1 text-xs font-sans text-slate-500">
                  Get daily picks on{' '}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#16DC76] hover:underline"
                  >
                    Instagram @repopicks
                  </a>{' '}
                  meanwhile.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-5 text-[11px] font-mono text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No spam
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Unsubscribe anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% automated
            </span>
          </div>
        </div>

        {/* What you get */}
        <section className="mt-14">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono text-center">
            What lands in your inbox
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WHAT_YOU_GET.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#131313] border border-white/10 rounded-xl p-5 shadow-md"
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <h3 className="mt-3 font-mono font-bold text-white text-sm">{item.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live sample */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              A taste of this week&apos;s picks
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Live sample from today&apos;s data
            </span>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-[#131313] overflow-hidden">
            <div className="border-b border-white/10 bg-[#1B1B1B] px-5 py-3">
              <p className="font-mono text-xs text-slate-400">
                <span className="text-white font-bold">Subject:</span> RepoPicks Weekly — 5
                repos rising right now
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {sample.map((repo, i) => (
                <div key={repo.id} className="px-5 py-4 flex items-start gap-4">
                  <span className="font-mono text-xs font-bold text-[#16DC76] mt-0.5 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/repo/${repo.owner}/${repo.name}`}
                      className="font-mono text-sm font-bold text-white hover:text-[#16DC76] transition-colors"
                    >
                      {repo.owner} / {repo.name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 truncate font-sans">
                      {repo.description || 'No description provided.'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      {repo.totalStars.toLocaleString()} stars ·{' '}
                      <span className="text-emerald-400">+{repo.starsGainedWeek} this week</span>
                      {repo.language ? ` · ${repo.language}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] font-mono text-slate-600">
            Sample only — the real email is composed fresh every Monday from the latest data.
          </p>
        </section>

        {/* Bottom CTA */}
        <section className="mt-14 text-center">
          <h2 className="text-xl font-bold text-white font-mono">
            Never miss a breakout again
          </h2>
          <div className="mt-5">
            {ready ? (
              <a
                href={NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#16DC76] px-8 py-3 text-sm font-mono font-bold text-black hover:bg-[#1FE084] active:scale-95 transition-all"
              >
                Subscribe free
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm font-mono text-slate-400">
                Launching soon — follow{' '}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#16DC76] hover:underline"
                >
                  @repopicks
                </a>{' '}
                for daily picks.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
