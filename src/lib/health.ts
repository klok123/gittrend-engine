import { calculateMaintenanceVitality } from '../engine/repo-intelligence';
import type { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

export type HealthLevel = 'healthy' | 'stable' | 'stale' | 'dormant' | 'unknown';

export interface HealthInfo {
  level: HealthLevel;
  /** Short human label, e.g. "Actively maintained". */
  label: string;
  /** Days since the last push to the default branch (from GitHub's pushedAt). */
  daysSinceLastPush: number;
  dotClass: string;
  textClass: string;
}

/**
 * Maintenance-health thresholds — single source of truth for the whole site.
 *
 * Derived from days-since-last-push (GitHub `pushedAt`, already in the dataset).
 * Reuses the engine's calculateMaintenanceVitality for the raw day count so the
 * repo dossier page and the feed cards can never disagree.
 *
 *   healthy (≤ 30 days):    actively maintained — commits within the last month.
 *   stable  (31–180 days):  maintained, slower cadence — typical for mature tools.
 *   stale   (181–365 days): no meaningful activity in 6+ months — adopt with care.
 *   dormant (> 365 days):   effectively unmaintained — a full year of silence.
 *   unknown:                pushedAt missing or unparsable — we show no signal
 *                           rather than a wrong one.
 *
 * Rationale: 30 days matches the intuitive "is anyone home" window; 180 days is
 * roughly two release cycles for most OSS projects; 365 days of silence is the
 * conventional "abandoned" line. Thresholds are deliberately conservative —
 * a "stable" badge must never read as a warning.
 */
export function getHealthLevel(repo: NormalizedTrendingRepo): HealthInfo {
  let daysSinceLastPush = Number.POSITIVE_INFINITY;
  try {
    const vitality = calculateMaintenanceVitality(repo);
    daysSinceLastPush = vitality.daysSinceLastPush;
  } catch {
    daysSinceLastPush = Number.POSITIVE_INFINITY;
  }

  if (!Number.isFinite(daysSinceLastPush)) {
    return {
      level: 'unknown',
      label: 'Activity unknown',
      daysSinceLastPush: -1,
      dotClass: 'bg-slate-500',
      textClass: 'text-slate-400',
    };
  }

  if (daysSinceLastPush <= 30) {
    return {
      level: 'healthy',
      label: 'Actively maintained',
      daysSinceLastPush,
      dotClass: 'bg-emerald-400',
      textClass: 'text-emerald-300',
    };
  }
  if (daysSinceLastPush <= 180) {
    return {
      level: 'stable',
      label: 'Maintained',
      daysSinceLastPush,
      dotClass: 'bg-sky-400',
      textClass: 'text-sky-300',
    };
  }
  if (daysSinceLastPush <= 365) {
    return {
      level: 'stale',
      label: 'Low activity',
      daysSinceLastPush,
      dotClass: 'bg-amber-400',
      textClass: 'text-amber-300',
    };
  }
  return {
    level: 'dormant',
    label: 'Dormant',
    daysSinceLastPush,
    dotClass: 'bg-rose-400',
    textClass: 'text-rose-300',
  };
}

/** Feed filter predicate for the "Actively maintained" chip. */
export function isActivelyMaintained(repo: NormalizedTrendingRepo): boolean {
  return getHealthLevel(repo).level === 'healthy';
}
