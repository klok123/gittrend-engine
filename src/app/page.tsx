import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../scripts/run-trend-etl';
import { ExploreClient } from './ExploreClient';
import { DailyPick } from '../components/PicksOfTheDay';

export const metadata: Metadata = {
  title: 'Trending GitHub Repositories Today | RepoPicks',
  description: 'RepoPicks — trending GitHub repositories, handpicked daily. Discover breakout open-source projects and developer tools ranked by true star velocity.',
  keywords: ['github trending', 'trending repositories', 'open source', 'star velocity', 'developer tools'],
  openGraph: {
    title: 'Trending GitHub Repositories Today | RepoPicks',
    description: 'RepoPicks — trending GitHub repositories, handpicked daily. Discover breakout open-source projects and developer tools ranked by true star velocity.',
    type: 'website',
  },
};

// Revalidate every hour (ISR edge caching)
export const revalidate = 3600;

function getTrendingData(): TrendingDataset {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[PAGE_LOAD_ERROR] Failed to read trending-summary.json:', err);
  }

  return {
    updatedAt: new Date().toISOString(),
    totalRepos: 0,
    repositories: [],
    languages: [],
    risingCount: 0,
    hiddenGemsCount: 0,
    anomalousCount: 0,
  };
}

export default function HomePage() {
  const initialData = getTrendingData();
  const { picks, picksUpdated } = getDailyPicks();

  // JSON-LD ItemList Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Trending GitHub Repositories',
    itemListElement: initialData.repositories.slice(0, 10).map((repo, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: repo.url,
      name: repo.fullName,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExploreClient initialData={initialData} picks={picks} picksUpdated={picksUpdated} />
    </>
  );
}

/** Curated picks live in public/data/picks.json — editable without touching code. */
function getDailyPicks(): { picks: DailyPick[]; picksUpdated?: string } {
  try {
    const picksPath = path.join(process.cwd(), 'public', 'data', 'picks.json');
    if (fs.existsSync(picksPath)) {
      const parsed = JSON.parse(fs.readFileSync(picksPath, 'utf8'));
      const picks = Array.isArray(parsed.picks) ? parsed.picks : [];
      return { picks, picksUpdated: parsed.generatedAt };
    }
  } catch (err) {
    console.error('[PAGE_LOAD_ERROR] Failed to read picks.json:', err);
  }
  return { picks: [] };
}
