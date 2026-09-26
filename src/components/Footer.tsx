import React from 'react';
import Link from 'next/link';
import { TrendingUp, Rss, Code2, BookOpen, ShieldCheck, Mail, Megaphone, Rocket } from 'lucide-react';
import { LANGUAGES_TO_TRACK, languageSlug } from '../lib/languages';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090A0F] mt-20 py-12">
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF7905] rounded-lg p-2 text-black shadow-[0_0_15px_rgba(255,121,5,0.3)]">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white font-mono">RepoPicks</span>
              <p className="text-xs text-slate-400 mt-0.5 max-w-md leading-relaxed">
                Trending open-source, handpicked daily. Star-velocity radar plus human curation by @repopicks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-400">
            <a
              href="https://www.instagram.com/repopicks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <InstagramIcon className="h-3.5 w-3.5 text-[#FF7905]" />
              <span>@repopicks</span>
            </a>
            <a
              href="mailto:hello@repopicks.dev?subject=Advertising%20on%20RepoPicks"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Megaphone className="h-3.5 w-3.5 text-[#FF7905]" />
              <span>Advertise with us</span>
            </a>
            <a
              href="mailto:hello@repopicks.dev"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Contact</span>
            </a>
            <Link
              href="/newsletter"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#FF7905]" />
              <span>Newsletter</span>
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Rocket className="h-3.5 w-3.5 text-emerald-400" />
              <span>Submit a project</span>
            </Link>
            <Link
              href="/methodology"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#FF7905]" />
              <span>Methodology</span>
            </Link>
            <Link
              href="/api/trending"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Public JSON API</span>
            </Link>
            <Link
              href="/feed.xml"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-[#FF7905] transition-colors"
            >
              <Rss className="h-3.5 w-3.5 text-amber-400" />
              <span>RSS 2.0 Feed</span>
            </Link>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Anti-Fraud Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs font-mono text-slate-500">
          Ranked purely by verified star velocity. 0 sponsored biases. Unaffiliated with GitHub Inc.
        </div>

        {/* Per-language RSS feeds */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-mono text-slate-600">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Rss className="h-3 w-3 text-amber-400" />
            RSS by language:
          </span>
          {LANGUAGES_TO_TRACK.map((lang) => (
            <a
              key={lang}
              href={`/rss/${languageSlug(lang)}.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF7905] transition-colors"
            >
              {lang}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
