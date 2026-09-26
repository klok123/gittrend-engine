/**
 * Weekly digest composer + sender (RepoPicks Weekly).
 *
 * Run by .github/workflows/weekly-digest.yml every Monday 09:00 UTC.
 * Fully automated — zero human input.
 *
 * Reads public/data/trending-summary.json (written by the 6h trend ETL),
 * picks the week's top rising repos, breakouts, and hidden gems, composes
 * a markdown email (Buttondown renders markdown natively), and sends it via
 * the Buttondown API with status "about_to_send" (immediate dispatch —
 * verified against Buttondown's API docs; auth header is `Token`, not Bearer).
 *
 * ONE-TIME SETUP (owner): create a free Buttondown account and add its API
 * key as the BUTTONDOWN_API_KEY repository secret. Until then this script
 * logs a clear line and exits 0 — the workflow never fails, and nothing
 * else is affected.
 *
 * NOTE: intentionally does NOT import scripts/run-trend-etl.ts — that module
 * can execute pipeline code on import. The minimal structural interface below
 * is all this script needs.
 */

import fs from 'fs';
import path from 'path';

interface DigestRepo {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  description: string;
  url: string;
  language: string;
  totalStars: number;
  starsGainedWeek: number;
  starsGainedToday: number;
  velocityScore: number;
  breakoutScore: number;
  isHiddenGem: boolean;
  anomalyStatus: 'NORMAL' | 'REVIEW' | 'ANOMALOUS SIGNAL';
}

interface DigestDataset {
  repositories: DigestRepo[];
}

const BUTTONDOWN_API = 'https://api.buttondown.email/v1/emails';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app';

function loadDataset(): DigestDataset {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw) as DigestDataset;
}

function repoLine(r: DigestRepo): string {
  const desc = (r.description || 'No description provided.').trim().split('\n')[0];
  return (
    `### [${r.fullName}](${r.url})\n` +
    `${desc}\n\n` +
    `⭐ ${r.totalStars.toLocaleString()} stars · ` +
    `📈 +${r.starsGainedWeek.toLocaleString()} this week` +
    (r.language ? ` · ${r.language}` : '') +
    `\n`
  );
}

function composeDigest(repos: DigestRepo[]): { subject: string; body: string } {
  const clean = repos.filter((r) => r.anomalyStatus === 'NORMAL');
  const picked = new Set<number>();

  const take = (list: DigestRepo[], n: number): DigestRepo[] => {
    const out: DigestRepo[] = [];
    for (const r of list) {
      if (out.length >= n) break;
      if (!picked.has(r.id)) {
        picked.add(r.id);
        out.push(r);
      }
    }
    return out;
  };

  const topRising = take([...clean].sort((a, b) => b.velocityScore - a.velocityScore), 5);
  const breakouts = take(
    [...clean].sort((a, b) => b.breakoutScore - a.breakoutScore).filter((r) => r.starsGainedToday > 0),
    3
  );
  const gems = take(
    [...clean].filter((r) => r.isHiddenGem).sort((a, b) => b.velocityScore - a.velocityScore),
    2
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  const subject = `RepoPicks Weekly — 5 repos rising right now (${dateStr})`;

  const sections: string[] = [];
  sections.push(`# RepoPicks Weekly\n`);
  sections.push(
    `The 5 fastest-rising open-source repos, early breakouts, and a hidden gem — ranked by star velocity, fraud-audited.\n`
  );

  if (topRising.length > 0) {
    sections.push(`## 🚀 Top 5 rising this week\n`);
    sections.push(topRising.map(repoLine).join('\n'));
  }
  if (breakouts.length > 0) {
    sections.push(`## ⚡ Breakout radar\n`);
    sections.push(`Caught early — before they go viral:\n`);
    sections.push(breakouts.map(repoLine).join('\n'));
  }
  if (gems.length > 0) {
    sections.push(`## 💎 Hidden gems\n`);
    sections.push(`Quality repos the trending algorithms missed:\n`);
    sections.push(gems.map(repoLine).join('\n'));
  }

  sections.push(`---\n`);
  sections.push(
    `Explore live: [Trending](${SITE_URL}) · [Breakouts](${SITE_URL}/breakouts) · [Hidden Gems](${SITE_URL}/hidden-gems)\n`
  );
  sections.push(`You're receiving this because you subscribed to the RepoPicks Weekly. Unsubscribe anytime.`);

  return { subject, body: sections.join('\n') };
}

async function sendViaButtondown(apiKey: string, subject: string, body: string): Promise<void> {
  const res = await fetch(BUTTONDOWN_API, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      body,
      // "about_to_send" dispatches immediately (verified vs Buttondown API docs).
      // "draft" would park it in the dashboard for manual review instead.
      status: 'about_to_send',
      email_type: 'public',
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Buttondown API rejected the digest (HTTP ${res.status}): ${detail.slice(0, 300)}`);
  }

  const payload = (await res.json().catch(() => ({}))) as { id?: string };
  console.log(`[digest] Sent via Buttondown (email id: ${payload.id || 'unknown'}).`);
}

async function main(): Promise<void> {
  const apiKey = process.env.BUTTONDOWN_API_KEY || '';

  if (!apiKey) {
    // Graceful skip: the owner hasn't done the one-time Buttondown setup yet.
    // This is expected — log clearly and exit 0 so the workflow stays green.
    console.log(
      '[digest] BUTTONDOWN_API_KEY secret is not set — skipping send. ' +
        'One-time setup: create a free Buttondown account and add its API key as the ' +
        'BUTTONDOWN_API_KEY repository secret; the digest starts automatically after that.'
    );
    return;
  }

  const dataset = loadDataset();
  if (!dataset.repositories || dataset.repositories.length === 0) {
    throw new Error('[digest] trending-summary.json has no repositories — refusing to send an empty digest.');
  }

  const { subject, body } = composeDigest(dataset.repositories);
  console.log(`[digest] Composed "${subject}" (${body.length} chars).`);
  await sendViaButtondown(apiKey, subject, body);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
