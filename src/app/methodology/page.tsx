import React from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { BookOpen, ShieldCheck, Cpu, Code2, Award, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ranking Methodology & Mathematical Models | RepoPicks',
  description: 'Complete transparent documentation of star velocity scoring, candidate models, and anomaly heuristics.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full text-xs font-bold text-[#16DC76] font-mono mb-4">
            <BookOpen className="h-4 w-4" />
            TRANSPARENT OPEN ALGORITHMS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            How Ranking Works
          </h1>
          <p className="text-slate-400 mt-3 text-base max-w-lg mx-auto leading-relaxed">
            No black boxes. No paid sponsor placement. Pure empirical star velocity and organic community verification.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Core Velocity */}
          <section className="bg-[#131313] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-[#16DC76]" />
              1. The Momentum-Log Formula
            </h2>
            <div className="my-5 p-4 bg-[#1B1B1B] border border-white/10 rounded-lg font-mono text-center text-base sm:text-lg font-bold text-[#16DC76] overflow-x-auto">
              Daily Score = (&Delta; Stars)&sup2; &divide; ln(Total Stars + 10)
            </div>
            <p className="text-slate-300 leading-relaxed">
              Squaring the daily star delta (&Delta;&sup2;) strongly rewards explosive organic momentum. 
              The denominator—the natural logarithm of lifetime stars ln(Total + 10)—gently dampens the advantage 
              of established mega-repositories (e.g. Linux, React, VS Code) that accumulate hundreds of baseline stars 
              routinely. This allows a small, breakout project with 400 stars today to outrank a giant gaining 300 stars.
            </p>
          </section>

          {/* Section 2: Rising Stars */}
          <section className="bg-[#131313] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Code2 className="h-5 w-5 text-amber-400" />
              2. Proportional Acceleration (&ldquo;Rising Stars&rdquo;)
            </h2>
            <div className="my-5 p-4 bg-[#1B1B1B] border border-white/10 rounded-lg font-mono text-center text-sm sm:text-base font-bold text-amber-300 overflow-x-auto">
              Breakout Ratio = [&Delta; Stars 24h &divide; max(Total Stars - &Delta; Stars, 10)] &times; 100%
            </div>
            <p className="text-slate-300 leading-relaxed">
              Measures percentage expansion in 24 hours. A new repository growing from 50 to 250 stars in one day 
              has a Breakout Ratio of 400%, spotlighting nascent technologies before they cross 10k stars.
            </p>
          </section>

          {/* Section 3: Organic Trust Score */}
          <section className="bg-[#131313] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Award className="h-5 w-5 text-emerald-400" />
              3. Organic Trust Score ($0–100) &amp; Fraud Gate
            </h2>
            <div className="my-5 p-4 bg-[#1B1B1B] border border-white/10 rounded-lg font-mono text-center text-sm sm:text-base font-bold text-emerald-400 overflow-x-auto">
              Fork Ratio = Forks &divide; max(1, Total Stars) &middot; Anomaly Penalty Gate
            </div>
            <p className="text-slate-300 leading-relaxed">
              Bot-farmed repositories frequently exhibit thousands of stars with fewer than 5 forks (&lt;0.1% ratio). 
              Our engine audits community fork dispersion, rewarding healthy 5%–25% ratios with <strong>Grade A / A+</strong> ratings 
              and penalizing synthetic spikes with <strong>Grade F</strong> flags.
            </p>
          </section>

          {/* Section 4: Maintenance Vitality */}
          <section className="bg-[#131313] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-purple-400" />
              4. Maintenance Vitality &amp; Cadence
            </h2>
            <p className="text-slate-300 mt-2 leading-relaxed">
              Measures active developer commitment via push recency:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-400 font-mono text-xs sm:text-sm">
              <li><strong className="text-emerald-400">HYPER-ACTIVE:</strong> Pushed commits within the trailing 7 days.</li>
              <li><strong className="text-blue-400">ACTIVE:</strong> Pushed commits within the trailing 30 days.</li>
              <li><strong className="text-amber-400">STABLE:</strong> Maintenance commits within the past 6 months.</li>
              <li><strong className="text-slate-500">DORMANT:</strong> No commit activity in &gt;180 days.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
