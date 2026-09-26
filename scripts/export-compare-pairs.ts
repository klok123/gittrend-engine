/**
 * Exports the compare-pair list consumed by scripts/laya-verdicts.py.
 * Mirrors the pair selection in the compare page's generateStaticParams
 * (top 40 trending repos x top 2 alternatives), so ETL verdicts always cover
 * the pairs the site pre-renders.
 *
 * Usage: npx tsx scripts/export-compare-pairs.ts
 * Writes: public/data/compare-pairs.json  (array of [fullNameA, fullNameB], sorted)
 */
import fs from 'fs';
import path from 'path';
import { findAlternatives } from '../src/lib/similar';
import type { TrendingDataset } from './run-trend-etl';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
const OUT_PATH = path.join(process.cwd(), 'public', 'data', 'compare-pairs.json');

function main() {
  const dataset: TrendingDataset = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const seen = new Set<string>();
  const pairs: [string, string][] = [];
  for (const repo of dataset.repositories.slice(0, 40)) {
    for (const alt of findAlternatives(repo, dataset.repositories, 2)) {
      const names = [repo.fullName.toLowerCase(), alt.repo.fullName.toLowerCase()].sort();
      const key = names.join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([names[0], names[1]]);
    }
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(pairs, null, 2));
  console.log(`[compare-pairs] wrote ${pairs.length} pairs -> ${OUT_PATH}`);
}

main();
