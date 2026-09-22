import React from 'react';
import Link from 'next/link';
import { TrendingUp, Rss, Code2, BookOpen, ShieldCheck } from 'lucide-react';

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
              <span className="font-extrabold text-base text-white font-mono">GitTrend Radar</span>
              <p className="text-xs text-slate-400 mt-0.5 max-w-md leading-relaxed">
                Algorithmic GitHub trend discovery, star-velocity vectors, and organic trust auditing. Built on $0 creator budget.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-400">
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
      </div>
    </footer>
  );
}
