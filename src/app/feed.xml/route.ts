import fs from 'fs';
import path from 'path';

export const revalidate = 3600;

export async function GET() {
  let repositories: any[] = [];

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      repositories = data.repositories.slice(0, 25);
    }
  } catch (e) {
    console.error(e);
  }

  const itemsXml = repositories
    .map((repo, idx) => `
    <item>
      <title><![CDATA[#${idx + 1} ${repo.fullName} (+${repo.starsGainedToday} stars today)]]></title>
      <link>${repo.url}</link>
      <guid>${repo.url}</guid>
      <description><![CDATA[${repo.description || 'Trending open-source repository.'}]]></description>
      <category>${repo.language}</category>
      <pubDate>${new Date(repo.pushedAt || Date.now()).toUTCString()}</pubDate>
    </item>`)
    .join('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app';

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>RepoPicks — Daily Trending GitHub Repositories</title>
    <link>${siteUrl}</link>
    <description>Daily trending GitHub repositories ranked by star momentum and velocity.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
