/**
 * archive.ts — server-side helpers for reading the auto-generated daily
 * archive snapshots at public/data/archive/YYYY/MM/DD.json.
 *
 * Snapshots are written idempotently by scripts/run-trend-etl.ts (same-day
 * runs overwrite) and backfilled from Postgres velocity history when
 * available. Zero manual input.
 */
import fs from 'fs';
import path from 'path';
import type { ArchiveDayFile } from '../../scripts/run-trend-etl';

const ARCHIVE_ROOT = path.join(process.cwd(), 'public', 'data', 'archive');

/** All archived dates (YYYY-MM-DD), newest first. */
export function listArchiveDates(): string[] {
  const dates: string[] = [];
  try {
    if (!fs.existsSync(ARCHIVE_ROOT)) return dates;
    for (const year of fs.readdirSync(ARCHIVE_ROOT)) {
      const yearDir = path.join(ARCHIVE_ROOT, year);
      if (!fs.statSync(yearDir).isDirectory()) continue;
      for (const month of fs.readdirSync(yearDir)) {
        const monthDir = path.join(yearDir, month);
        if (!fs.statSync(monthDir).isDirectory()) continue;
        for (const file of fs.readdirSync(monthDir)) {
          if (!file.endsWith('.json')) continue;
          const day = file.slice(0, -5);
          if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
            dates.push(`${year}-${month}-${day}`);
          }
        }
      }
    }
  } catch (e) {
    console.error('[ARCHIVE] Failed to list archive dates:', e);
  }
  return dates.sort().reverse();
}

/** Read one day's snapshot, or null when it does not exist / is unreadable. */
export function readArchiveDay(dateStr: string): ArchiveDayFile | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(ARCHIVE_ROOT, y, m, `${d}.json`);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ArchiveDayFile;
  } catch (e) {
    console.error(`[ARCHIVE] Failed to read ${dateStr}:`, e);
    return null;
  }
}
