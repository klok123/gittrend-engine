import React from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { BookOpen, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ranking Methodology & Mathematical Models | GitTrend',
  description: 'Complete transparent documentation of star velocity scoring, candidate models, and anomaly heuristics.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-slate-900 font-sans">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-black px-3 py-1 rounded-full text-xs font-bold text-black font-mono mb-3">
            <BookOpen className="h-4 w-4 text-[#FF7905]" />
            TRANSPARENT OPEN ALGORITHMS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black font-mono">
            How Ranking Works
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            No black boxes. No paid sponsor placement. Pure empirical momentum.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Core Velocity */}
          <section className="bg-white border-2 border-black rounded-lg p-6 shadow-[3px_3px_0_0_#000]">
            <h2 className="text-xl font-bold font-mono text-black flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[#FF7905]" />
              1. The Momentum-Log Formula
            </h2>
            <div className="my-4 p-4 bg-slate-50 border border-black/20 rounded font-mono text-center text-base sm:text-lg font-bold text-slate-900 overflow-x-auto">
              Daily Score = (&Delta; Stars)&sup2; &divide; ln(Total Stars + 10)
            </div>
            <p className="text-slate-700">
              Squaring the daily star delta (&Delta;&sup2;) strongly rewards explosive organic momentum. 
              The denominator—the natural logarithm of lifetime stars ln(Total + 10)—gently dampens the advantage 
              of established mega-repositories (e.g. Linux, React, VS Code) that accumulate hundreds of baseline stars 
              routinely. This allows a small, breakout project with 400 stars today to outrank a giant gaining 300 stars.
            </p>
          </section>

          {/* Section 2: Rising Stars */}
          <section className="bg-white border-2 border-black rounded-lg p-6 shadow-[3px_3px_0_0_#000]">
            <h2 className="text-xl font-bold font-mono text-black flex items-center gap-2">
              <Code2 className="h-5 w-5 text-amber-600" />
              2. Proportional Acceleration (&ldquo;Rising Stars&rdquo;)
            </h2>
            <div className="my-4 p-4 bg-slate-50 border border-black/20 rounded font-mono text-center text-sm sm:text-base font-bold text-slate-900 overflow-x-auto">
              Breakout Ratio = [&Delta; Stars 24h &divide; max(Total Stars - &Delta; Stars, 10)] &times; 100%
            </div>
            <p className="text-slate-700">
              Measures percentage expansion in 24 hours. A new repository growing from 50 to 250 stars in one day 
              has a Breakout Ratio of 400%, spotlighting nascent technologies before they cross 10k stars.
            </p>
          </section>

          {/* Section 3: Anomaly Scoring */}
          <section className="bg-white border-2 border-black rounded-lg p-6 shadow-[3px_3px_0_0_#000]">
            <h2 className="text-xl font-bold font-mono text-black flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              3. Evidence-Based Anomaly Scoring
            </h2>
            <p className="text-slate-700 mt-2">
              Instead of binary bans or assuming zero forks implies fraud, our engine evaluates four orthogonal vectors:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-slate-600 font-mono text-xs sm:text-sm">
              <li><strong>Velocity Spurt Factor (+0.35):</strong> &gt;500 stars gained in 24h with zero forks.</li>
              <li><strong>Fork/Star Disparity (+0.25):</strong> &gt;1,000 lifetime stars with exactly 0 forks and issues disabled.</li>
              <li><strong>Account Freshness (+0.20):</strong> Owner profile registered &lt;48 hours prior to entering trending.</li>
              <li><strong>Commit Stagnation (+0.20):</strong> Zero commits in &gt;180 days accompanied by sudden &gt;500 star spike.</li>
            </ul>
            <div className="mt-4 p-3 bg-slate-100 rounded text-xs font-mono text-slate-700">
              Repositories scoring &lt;0.30 are categorized as <strong>NORMAL</strong>. Scores between 0.30 and 0.64 display an <strong>Under Review</strong> badge. Scores &ge;0.65 are flagged as <strong>ANOMALOUS SIGNAL</strong> and filtered from default views.
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
