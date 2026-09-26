import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { TrendingDataset } from '../../scripts/run-trend-etl';
import { findAlternatives } from '../lib/similar';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app';
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rising`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hidden-gems`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      const dataset: TrendingDataset = JSON.parse(content);
      const repoRoutes: MetadataRoute.Sitemap = dataset.repositories.slice(0, 100).map((r) => ({
        url: `${baseUrl}/repo/${r.owner}/${r.name}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      }));
      // Head-to-head compare pages for the top alternative pairs.
      const seenPairs = new Set<string>();
      const compareRoutes: MetadataRoute.Sitemap = [];
      for (const repo of dataset.repositories.slice(0, 40)) {
        for (const alt of findAlternatives(repo, dataset.repositories, 2)) {
          const pair = [repo, alt.repo]
            .sort((x, y) => (x.fullName.toLowerCase() < y.fullName.toLowerCase() ? -1 : 1));
          const key = pair.map((r) => r.fullName.toLowerCase()).join('|');
          if (seenPairs.has(key)) continue;
          seenPairs.add(key);
          compareRoutes.push({
            url: `${baseUrl}/compare/${pair[0].owner}/${pair[0].name}/vs/${pair[1].owner}/${pair[1].name}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.6,
          });
        }
      }
      return [...coreRoutes, ...repoRoutes, ...compareRoutes];
    }
  } catch (err) {
    console.error('[SITEMAP_ERROR] Failed to append repository routes:', err);
  }

  return coreRoutes;
}

