/**
 * generate-picks.ts — fully automated "Picks of the Day" builder.
 *
 * - Reads public/data/trending-summary.json (written by run-trend-etl.ts)
 * - Selects the top 5 repos by stars gained today, excluding forks,
 *   anomalous signals, and repos without a usable English description.
 * - Writes public/data/picks.json (consumed by the PicksOfTheDay component)
 * - Writes public/picks.xml (RSS 2.0 feed for newsletter RSS-to-email)
 *
 * Runs automatically inside the trend-etl GitHub workflow. Can also be run
 * standalone:  npx tsx scripts/generate-picks.ts
 *
 * ZERO manual input — do not hand-edit the generated files.
 */
import fs from 'fs';
import path from 'path';
import type { TrendingDataset, NormalizedTrendingRepo } from './run-trend-etl';

const FALLBACK_DESCRIPTION = 'Open-source software repository with active community momentum.';
const MAX_PICKS = 5;

export interface AutoPick {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  topics: string[];
  language: string;
  totalStars: number;
  starsGainedToday: number;
}

/** Collapse to one line; reject empty / generic / too-short / non-English text. */
export function cleanDescription(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const oneLine = raw.replace(/\s+/g, ' ').trim();
  if (!oneLine || oneLine === FALLBACK_DESCRIPTION) return null;
  if (oneLine.length < 20) return null;
  // Heuristic: keep descriptions that are mostly Latin-script (English audience).
  const latin = (oneLine.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length;
  const cjk = (oneLine.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const scripted = latin + cjk;
  if (scripted > 0 && latin / scripted < 0.6) return null;
  let out = oneLine;
  if (out.length > 200) {
    const cut = out.lastIndexOf(' ', 200);
    out = (cut > 120 ? out.slice(0, cut) : out.slice(0, 200)).trimEnd() + '…';
  }
  return out;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function selectPicks(repos: NormalizedTrendingRepo[]): AutoPick[] {
  const candidates = repos.filter(
    (r) =>
      !r.isFork &&
      r.anomalyStatus !== 'ANOMALOUS SIGNAL' &&
      r.starsGainedToday > 0 &&
      cleanDescription(r.description) !== null
  );
  candidates.sort((a, b) => b.starsGainedToday - a.starsGainedToday);
  return candidates.slice(0, MAX_PICKS).map((r) => ({
    owner: r.owner,
    name: r.name,
    fullName: r.fullName,
    url: r.url,
    description: cleanDescription(r.description) as string,
    topics: (r.topics || []).slice(0, 5),
    language: r.language,
    totalStars: r.totalStars,
    starsGainedToday: r.starsGainedToday,
  }));
}

function buildRss(picks: AutoPick[], siteUrl: string, updatedAt: string): string {
  const items = picks
    .map(
      (p) => `    <item>
      <title><![CDATA[${p.fullName} (+${p.starsGainedToday.toLocaleString('en-US')} stars today)]]></title>
      <link>${escapeXml(p.url)}</link>
      <guid isPermaLink="false">${escapeXml(p.url)}#${updatedAt.slice(0, 10)}</guid>
      <description><![CDATA[${p.description}]]></description>
      ${(p.topics || []).map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
      <pubDate>${new Date(updatedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>RepoPicks — Picks of the Day</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Handpicked trending open-source repositories, refreshed automatically every day. Powered by star velocity.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(updatedAt).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

export function generateDailyPicks(
  dataset: TrendingDataset,
  siteUrl: string = process.env.SITE_URL || 'https://clever-volta-lac.vercel.app'
): AutoPick[] {
  const picks = selectPicks(dataset.repositories || []);
  const updatedAt = dataset.updatedAt || new Date().toISOString();

  const picksPath = path.join(process.cwd(), 'public', 'data', 'picks.json');
  fs.writeFileSync(
    picksPath,
    JSON.stringify(
      {
        generatedAt: updatedAt,
        generatedBy: 'trend-etl (automated — do not edit manually)',
        siteUrl,
        picks,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  console.log(`📌 Wrote ${picks.length} auto picks to: ${picksPath}`);

  const rssPath = path.join(process.cwd(), 'public', 'picks.xml');
  fs.writeFileSync(rssPath, buildRss(picks, siteUrl, updatedAt), 'utf8');
  console.log(`📻 Wrote picks RSS feed to: ${rssPath}`);

  return picks;
}

// Standalone mode: npx tsx scripts/generate-picks.ts
if (require.main === module) {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ ${dataPath} not found — run the ETL first.`);
    process.exit(1);
  }
  const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TrendingDataset;
  const picks = generateDailyPicks(dataset);
  console.log(`✅ Done — ${picks.length} picks: ${picks.map((p) => p.fullName).join(', ')}`);
}
