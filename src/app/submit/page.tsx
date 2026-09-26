'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Rocket, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Search, Info } from 'lucide-react';

interface RepoPreview {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
  html_url: string;
  owner: { login: string; avatar_url: string };
}

function parseRepoInput(input: string): string | null {
  const trimmed = input.trim().replace(/\/$/, '');
  // Accept full URLs or owner/name
  const urlMatch = trimmed.match(/github\.com\/([^/]+\/[^/]+)/i);
  const candidate = urlMatch ? urlMatch[1] : trimmed;
  return /^[^/\s]+\/[^/\s]+$/.test(candidate) ? candidate : null;
}

export default function SubmitPage() {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repo, setRepo] = useState<RepoPreview | null>(null);

  const checkRepo = async () => {
    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError('Enter a valid repository like "owner/name" or a full github.com URL.');
      setRepo(null);
      return;
    }
    setLoading(true);
    setError(null);
    setRepo(null);
    try {
      const res = await fetch(`https://api.github.com/repos/${parsed}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (res.status === 404) {
        setError('Repository not found on GitHub. Check the owner/name spelling.');
        return;
      }
      if (!res.ok) {
        setError('GitHub API is rate-limited right now. Try again in a minute.');
        return;
      }
      const data: RepoPreview = await res.json();
      setRepo(data);
    } catch {
      setError('Could not reach GitHub. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const checks = repo
    ? [
        {
          label: 'Has a real description',
          pass: Boolean(repo.description && repo.description.trim().length >= 15),
          hint: 'Gems need a 15+ character description',
        },
        {
          label: 'Not a fork',
          pass: !repo.fork,
          hint: 'Original work only — forks are excluded',
        },
        {
          label: 'Recently active',
          pass: Date.now() - new Date(repo.pushed_at).getTime() < 180 * 86400000,
          hint: 'Pushed within the last 6 months',
        },
        {
          label: 'Community forks',
          pass: repo.forks_count >= 3,
          hint: 'At least 3 forks signals real usage',
        },
      ]
    : [];

  const allPass = checks.length > 0 && checks.every((c) => c.pass);

  const issueUrl = repo
    ? (() => {
        const title = `Submission: ${repo.full_name}`;
        const body = [
          `Repository: ${repo.full_name}`,
          `Submitter: ${username.trim() ? `@${username.trim().replace(/^@/, '')}` : '(anonymous)'}`,
          `Note: ${note.trim() || '(none)'}`,
          '',
          '---',
          'Submitted via repopicks submit page. Auto-checked against the public methodology.',
          '<!-- repopicks-submission v1 -->',
        ].join('\n');
        const params = new URLSearchParams({ labels: 'submission', title, body });
        return `https://github.com/klok123/gittrend-engine/issues/new?${params.toString()}`;
      })()
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 font-sans">
      <Header />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full text-xs font-bold text-[#FF7905] font-mono mb-4">
            <Rocket className="h-4 w-4" />
            COMMUNITY SPOTLIGHT
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            Submit Your Project
          </h1>
          <p className="text-slate-400 mt-3 text-base max-w-lg mx-auto leading-relaxed">
            Built something worth trending? Submit it for a community spotlight. Every submission is
            automatically checked against our public ranking methodology — no editors, no favorites.
          </p>
        </div>

        <div className="bg-[#11131F] border border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-5">
          <div>
            <label htmlFor="repo-input" className="block text-sm font-bold font-mono text-white mb-2">
              GitHub repository
            </label>
            <div className="flex gap-2">
              <input
                id="repo-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkRepo()}
                placeholder="owner/name or https://github.com/owner/name"
                className="flex-1 bg-[#181A2B] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7905]/60 font-mono"
              />
              <button
                onClick={checkRepo}
                disabled={loading || !input.trim()}
                className="px-5 py-2.5 bg-[#FF7905] text-black font-bold font-mono text-sm rounded-lg hover:bg-[#ff8a1f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Check
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
          </div>

          {repo && (
            <div className="border border-white/10 rounded-lg p-4 bg-[#181A2B] space-y-4">
              <div className="flex items-start gap-3">
                <img src={repo.owner.avatar_url} alt="" className="h-10 w-10 rounded-lg" />
                <div className="min-w-0">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-white hover:text-[#FF7905] transition-colors break-all"
                  >
                    {repo.full_name}
                  </a>
                  <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                    {repo.description || 'No description provided.'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1.5">
                    ⭐ {repo.stargazers_count.toLocaleString()} · 🍴 {repo.forks_count.toLocaleString()}
                    {repo.language ? ` · ${repo.language}` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-start gap-2 text-sm">
                    {c.pass ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span className={c.pass ? 'text-slate-300' : 'text-slate-400'}>
                      {c.label}
                      {!c.pass && <span className="text-slate-500"> — {c.hint}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {!allPass && (
                <p className="text-xs text-amber-300/90 leading-relaxed flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  Amber checks are advisory — you can still submit, but the automatic quality gate
                  may hold the spotlight until they improve.
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="gh-user" className="block text-xs font-bold font-mono text-slate-300 mb-1.5">
                    Your GitHub username <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="gh-user"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@you"
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7905]/60 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="note" className="block text-xs font-bold font-mono text-slate-300 mb-1.5">
                    Why is it interesting? <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="One line pitch"
                    maxLength={200}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7905]/60"
                  />
                </div>
              </div>

              <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#FF7905] text-black font-bold font-mono text-sm rounded-lg hover:bg-[#ff8a1f] transition-colors"
              >
                <Rocket className="h-4 w-4" />
                Submit for spotlight
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Opens a pre-filled GitHub issue — you&rsquo;ll need a GitHub account, which keeps spam out.
                Our pipeline picks it up automatically within 6 hours.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-[#11131F] border border-white/10 rounded-xl p-6 text-sm text-slate-400 leading-relaxed">
          <h2 className="font-bold font-mono text-white mb-3">How submissions work</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>You submit — a structured issue is created with your repository details.</li>
            <li>Our pipeline verifies the repo via the GitHub API and runs the same anomaly and quality gates as every ranked repository.</li>
            <li>Passing submissions appear in the <strong className="text-white">Community Picks</strong> shelf on the homepage, clearly labeled as submitted — never ranked as organic trending.</li>
            <li>Submissions tripping anomaly signals are held back automatically. No manual review, no exceptions.</li>
          </ol>
        </div>
      </main>
      <Footer />
    </div>
  );
}
