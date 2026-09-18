import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { TrendingDataset } from '../../scripts/run-trend-etl';
import { ExploreClient } from './ExploreClient';

export const metadata: Metadata = {
  title: 'Trending GitHub Repositories Today | GitTrend',
  description: 'Discover trending GitHub repositories, track rising open source projects, and explore developer tools ranked by true star velocity — updated daily.',
  keywords: ['github trending', 'trending repositories', 'open source', 'star velocity', 'developer tools'],
  openGraph: {
    title: 'Trending GitHub Repositories Today | GitTrend',
    description: 'Discover trending GitHub repositories, track rising open source projects, and explore developer tools ranked by true star velocity — updated daily.',
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
      <ExploreClient initialData={initialData} />
    </>
  );
}
