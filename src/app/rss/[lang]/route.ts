/**
 * Per-language RSS feeds: /rss/python.xml, /rss/typescript.xml, ...
 * (also serves /rss/python without the extension).
 *
 * Built at request/build time from public/data/trending-summary.json —
 * no ETL change needed; the 6h data refresh flows through automatically.
 */
import fs from 'fs';
import path from 'path';
import type { NormalizedTrendingRepo } from  '../../../../scripts/run-trend-etl';
import { LANGUAGES_TO_TRACK, languageSlug, languageFromSlug } from '../../../lib/languages';

export const revalidate = 3600;

export async function generateStaticParams() {
  return LANGUAGES_TO_TRACK.map((lang) => ({ lang: `${languageSlug(lang)}.xml` }));
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getRepos(): NormalizedTrendingRepo[] {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return Array.isArray(data.repositories) ? data.repositories : [];
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const language = languageFromSlug(lang);

  if (!language) {
    return new Response('Unknown language. Valid feeds: ' + LANGUAGES_TO_TRACK.join(', '), {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const repos = getRepos()
    .filter(
      (r) =>
        r.language.toLowerCase() === language.toLowerCase() &&
        r.anomalyStatus !== 'ANOMALOUS SIGNAL'
    )
    .sort((a, b) => b.velocityScore - a.velocityScore)
    .slice(0, 25);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app';
  const feedUrl = `${siteUrl}/rss/${languageSlug(language)}.xml`;

  const itemsXml = repos
    .map(
      (repo, idx) => `
    <item>
      <title><![CDATA[#${idx + 1} ${repo.fullName} (+${repo.starsGainedToday} stars today)]]></title>
      <link>${repo.url}</link>
      <guid>${repo.url}</guid>
      <description><![CDATA[${repo.description || 'Trending open-source repository.'}]]></description>
      <category>${escapeXml(repo.language)}</category>
      <pubDate>${new Date(repo.pushedAt || Date.now()).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RepoPicks — Trending ${language} Repositories</title>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Daily trending ${language} GitHub repositories ranked by star momentum. Auto-refreshed every 6 hours.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
