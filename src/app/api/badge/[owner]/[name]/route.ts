import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TrendingDataset, NormalizedTrendingRepo } from '../../../../../../scripts/run-trend-etl';

export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await context.params;
  const fullName = `${owner}/${name}`.toLowerCase();

  let rank: number | null = null;
  let repoData: NormalizedTrendingRepo | null = null;

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      const dataset: TrendingDataset = JSON.parse(content);
      const idx = dataset.repositories.findIndex((r) => r.fullName.toLowerCase() === fullName);
      if (idx !== -1) {
        rank = idx + 1;
        repoData = dataset.repositories[idx];
      }
    }
  } catch (err) {
    console.error('[BADGE_ERROR] Failed to read dataset:', err);
  }

  // Determine badge text
  const label = 'GitTrend';
  let value = 'Tracked';
  let valueColor = '#24292e';

  if (rank !== null && repoData) {
    if (rank <= 10) {
      value = `#${rank} Trending`;
      valueColor = '#FF7905';
    } else if (repoData.starsGainedToday > 0) {
      value = `+${repoData.starsGainedToday} today`;
      valueColor = '#FF7905';
    } else if (repoData.isHiddenGem) {
      value = `Gem #${rank}`;
      valueColor = '#8b5cf6';
    } else {
      value = `Rank #${rank}`;
      valueColor = '#10b981';
    }
  }

  const safeLabel = escapeXml(label);
  const safeValue = escapeXml(value);

  // Approximate character widths for clean badge layout
  const labelWidth = Math.round(safeLabel.length * 6.5 + 14);
  const valueWidth = Math.round(safeValue.length * 6.8 + 14);
  const totalWidth = labelWidth + valueWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${safeLabel}: ${safeValue}">
  <title>${safeLabel}: ${safeValue}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#1b1f23"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${safeLabel}</text>
    <text x="${labelWidth * 5}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${safeLabel}</text>
    <text aria-hidden="true" x="${(labelWidth + valueWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}">${safeValue}</text>
    <text x="${(labelWidth + valueWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" font-weight="bold" textLength="${(valueWidth - 10) * 10}">${safeValue}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
