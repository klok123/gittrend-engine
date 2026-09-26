import React from 'react';
import Link from 'next/link';
import { Mail, ArrowUpRight } from 'lucide-react';
import { NEWSLETTER_URL, INSTAGRAM_URL } from '../siteConfig';

/**
 * Newsletter signup band.
 *
 * No fake backend: when NEWSLETTER_URL is configured (see src/siteConfig.ts),
 * the button opens the real subscribe page. Until then it honestly says the
 * newsletter is launching soon. Pair with RSS-to-email on /picks.xml for a
 * fully automated weekly email — see siteConfig.ts for the one-time setup.
 */
export function NewsletterSignup() {
  const ready = NEWSLETTER_URL.length > 0;

  return (
    <section
      aria-label="Newsletter signup"
      className="mb-10 rounded-xl border border-white/10 bg-[#131313] p-6 sm:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
    >
      <div className="mx-auto max-w-xl">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#16DC76] text-black">
          <Mail className="h-5 w-5 stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
          Get the 5 best repos every week
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-sans leading-relaxed">
          One short email, every week. The most useful open-source finds —
          no spam, unsubscribe anytime.
        </p>

        <div className="mt-5">
          {ready ? (
            <a
              href={NEWSLETTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#16DC76] px-6 py-2.5 text-sm font-mono font-bold text-black hover:bg-[#1FE084] active:scale-95 transition-all"
            >
              Subscribe free
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-sm font-mono text-slate-400">
              The weekly newsletter launches soon — get daily picks on{' '}
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
          )}
          <p className="mt-3 text-[11px] font-mono text-slate-500">
            <Link href="/newsletter" className="text-[#16DC76] hover:underline">
              What&apos;s inside each email →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
