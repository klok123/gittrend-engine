import React from 'react';
import Link from 'next/link';
import { TrendingUp, Rss, Code2, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white mt-16 py-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF7905] border-2 border-black rounded-md p-1.5 shadow-[2px_2px_0_0_#000]">
              <TrendingUp className="h-5 w-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base text-black font-mono">GitTrend</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Production-grade GitHub repository discovery & star-velocity analytics. Built on $0 initial creator budget.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <Link
              href="/methodology"
              className="flex items-center gap-1.5 hover:text-black hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Methodology
            </Link>
            <Link
              href="/api/trending"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-black hover:underline"
            >
              <Code2 className="h-3.5 w-3.5" />
              Public JSON API
            </Link>
            <Link
              href="/feed.xml"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-black hover:underline"
            >
              <Rss className="h-3.5 w-3.5" />
              RSS 2.0 Feed
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          Ranked purely by verified star momentum. No sponsored ranking biases. Unaffiliated with GitHub Inc.
        </div>
      </div>
    </footer>
  );
}
