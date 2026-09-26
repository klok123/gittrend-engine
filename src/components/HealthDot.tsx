'use client';

import React from 'react';
import { getHealthLevel } from '../lib/health';
import type { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

/**
 * Small maintenance-health dot for repo cards.
 * Tooltip states the raw fact (days since last push) — the dot is a
 * visualization of that fact, never a verdict on code quality.
 */
export function HealthDot({ repo }: { repo: NormalizedTrendingRepo }) {
  const health = getHealthLevel(repo);
  const ageText =
    health.daysSinceLastPush < 0
      ? 'last push date unknown'
      : health.daysSinceLastPush === 0
        ? 'pushed today'
        : health.daysSinceLastPush === 1
          ? 'pushed 1 day ago'
          : `pushed ${health.daysSinceLastPush} days ago`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${health.textClass}`}
      title={`Maintenance health: ${health.label} (${ageText}). Based on GitHub push activity.`}
    >
      <span className={`h-2 w-2 rounded-full ${health.dotClass} ring-1 ring-white/20`} />
      {health.label}
    </span>
  );
}
