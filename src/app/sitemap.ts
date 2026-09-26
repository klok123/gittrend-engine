import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { TrendingDataset } from '../../scripts/run-trend-etl';

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
      return [...coreRoutes, ...repoRoutes];
    }
  } catch (err) {
    console.error('[SITEMAP_ERROR] Failed to append repository routes:', err);
  }

  return coreRoutes;
}

