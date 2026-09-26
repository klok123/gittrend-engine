import React from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { BookOpen, ShieldCheck, Cpu, Code2, Award, Activity, Database, Gem, AlertTriangle, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ranking Methodology & Mathematical Models | RepoPicks',
  description: 'Complete transparent documentation of how RepoPicks collects GitHub data, scores star velocity, detects anomalies, and what the limits are.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full text-xs font-bold text-[#FF7905] font-mono mb-4">
            <BookOpen className="h-4 w-4" />
            TRANSPARENT OPEN ALGORITHMS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            How Ranking Works
          </h1>
          <p className="text-slate-400 mt-3 text-base max-w-lg mx-auto leading-relaxed">
            No black boxes. No paid placement. Every score below is computed from public GitHub data by open formulas — and the limits are stated honestly.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Data pipeline */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Database className="h-5 w-5 text-sky-400" />
              1. Data Collection
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-300">
              <li><strong className="text-white">Source:</strong> the official GitHub GraphQL API — star and fork totals are verified counts, never scraped estimates.</li>
              <li><strong className="text-white">Refresh:</strong> a fully automated pipeline runs every 6 hours and snapshots every tracked repository into a history database.</li>
              <li><strong className="text-white">Coverage:</strong> TypeScript, Python, Rust, Go, JavaScript, C++, Java, Swift, Kotlin and C#.</li>
              <li><strong className="text-white">Deltas:</strong> &ldquo;stars today / this week&rdquo; are computed as differences between verified snapshots — never from raw event counts.</li>
            </ul>
          </section>

          {/* Section 2: Core Velocity */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-[#FF7905]" />
              2. The Momentum-Log Formula
            </h2>
            <div className="my-5 p-4 bg-[#181A2B] border border-white/10 rounded-lg font-mono text-center text-base sm:text-lg font-bold text-[#FF7905] overflow-x-auto">
              Daily Score = (&Delta; Stars)&sup2; &divide; ln(Total Stars + 10)
            </div>
            <p className="text-slate-300 leading-relaxed">
              Squaring the daily star delta (&Delta;&sup2;) strongly rewards explosive organic momentum.
              The denominator — the natural logarithm of lifetime stars ln(Total + 10) — gently dampens the advantage
              of established mega-repositories (e.g. Linux, React, VS Code) that accumulate hundreds of baseline stars
              routinely. This allows a small, breakout project with 400 stars today to outrank a giant gaining 300 stars.
            </p>
          </section>

          {/* Section 3: Rising Stars */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Code2 className="h-5 w-5 text-amber-400" />
              3. Proportional Acceleration (&ldquo;Rising Stars&rdquo;)
            </h2>
            <div className="my-5 p-4 bg-[#181A2B] border border-white/10 rounded-lg font-mono text-center text-sm sm:text-base font-bold text-amber-300 overflow-x-auto">
              Breakout Ratio = [&Delta; Stars 24h &divide; max(Total Stars - &Delta; Stars, 10)] &times; 100%
            </div>
            <p className="text-slate-300 leading-relaxed">
              Measures percentage expansion in 24 hours. A repository is flagged <strong className="text-white">Rising</strong> when its
              breakout ratio exceeds 15% and it has fewer than 10,000 stars — spotlighting nascent technologies early.
              A <strong className="text-white">Hidden Gem</strong> additionally requires: at most 1,500 total stars, at least 25 stars gained
              in a day, at least 3 forks, and a real description (15+ characters).
            </p>
          </section>

          {/* Section 4: Organic Trust Score */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Award className="h-5 w-5 text-emerald-400" />
              4. Organic Trust Score (0–100) &amp; Anomaly Signals
            </h2>
            <div className="my-5 p-4 bg-[#181A2B] border border-white/10 rounded-lg font-mono text-center text-sm sm:text-base font-bold text-emerald-400 overflow-x-auto">
              Trust = fork dispersion + description &amp; topic signals &minus; anomaly penalties
            </div>
            <p className="text-slate-300 leading-relaxed">
              Healthy repositories show natural community behavior — forks spread across contributors, real descriptions,
              tagged topics. The engine checks five statistical signals: star/fork imbalance, fork-count mismatch,
              description absence, sparse-file anomalies, and massive single-day surges. Repositories tripping strong
              signals are marked <strong className="text-white">ANOMALOUS SIGNAL</strong> and hidden from rankings;
              borderline cases are marked <strong className="text-white">REVIEW</strong> but stay visible.
            </p>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Important: these are <em>statistical activity patterns</em>, not proof of wrongdoing. A legitimate viral
              launch can look unusual — which is exactly why borderline cases stay listed instead of being silently removed.
            </p>
          </section>

          {/* Section 5: Maintenance Vitality */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-purple-400" />
              5. Maintenance Vitality &amp; Cadence
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

          {/* Section 6: AI filter */}
          <section className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <Filter className="h-5 w-5 text-cyan-400" />
              6. AI/ML Exclusion View
            </h2>
            <p className="text-slate-300 leading-relaxed">
              AI and agent-framework repositories dominate raw trending lists, so a dedicated
              <strong className="text-white"> &ldquo;without AI&rdquo; view</strong> excludes them via topic, description and owner-name
              matching (covering the agentic era: agents, MCP servers, coding assistants) — with false-positive guards
              so words like <span className="font-mono text-sm">email</span>, <span className="font-mono text-sm">said</span> or
              <span className="font-mono text-sm"> bonsai</span> never trigger it.
            </p>
          </section>

          {/* Section 7: Limitations */}
          <section className="bg-[#11131F] border border-amber-400/25 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              7. Known Limitations
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-300">
              <li><strong className="text-white">Stars are popularity, not quality.</strong> We publish no synthesized ratings or reviews — only measured activity.</li>
              <li><strong className="text-white">Anomaly signals are statistical.</strong> They describe unusual growth patterns; they are not accusations.</li>
              <li><strong className="text-white">New repositories lack history.</strong> Week/month deltas and sparklines need several snapshots to become meaningful.</li>
              <li><strong className="text-white">Language detection is heuristic.</strong> Repositories GitHub can&rsquo;t classify are honestly labeled <span className="font-mono text-sm">Unknown</span>, never guessed.</li>
              <li><strong className="text-white">Data can lag GitHub by hours</strong> between the 6-hour pipeline runs.</li>
            </ul>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              Corrections are fixed at the data source, not patched per page. Ranking formulas live in open code — suggest improvements via GitHub.
            </p>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-[#FF7905]/15 to-transparent border border-[#FF7905]/30 rounded-xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#FF7905] font-bold font-mono text-xs uppercase tracking-wider mb-2">
              <Gem className="h-4 w-4" />
              Built something worth trending?
            </div>
            <h2 className="text-xl font-extrabold text-white font-mono">Submit your project</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Maintainers can submit their repository for a community spotlight — automatically checked against the same quality gates above.
            </p>
            <a
              href="/submit"
              className="inline-block mt-4 px-6 py-2.5 bg-[#FF7905] text-black font-bold font-mono text-sm rounded-lg hover:bg-[#ff8a1f] transition-colors"
            >
              Submit a repository
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
