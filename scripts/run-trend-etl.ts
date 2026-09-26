import fs from 'fs';
import path from 'path';
import { GitHubGraphQLClient, RawRepoNode } from '../src/engine/graphql-client';
import { VelocityLogStrategy, GravityDecayStrategy, BreakoutStrategy, isHiddenGem, isVerifiedHiddenGem, isVerifiedRising } from '../src/engine/ranking';
import { AnomalyDetector } from '../src/engine/anomaly';
import { getDbPool, isDatabaseConfigured } from '../src/lib/db';
import { LANGUAGES_TO_TRACK } from '../src/lib/languages';

export interface NormalizedTrendingRepo {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  language: string;
  languageColor: string;
  topics: string[];
  totalStars: number;
  forksCount: number;
  openIssuesCount: number;
  starsGainedToday: number;
  starsGainedWeek: number;
  starsGainedMonth: number;
  velocityScore: number;
  breakoutScore: number;
  isRising: boolean;
  isHiddenGem: boolean;
  anomalyScore: number;
  anomalyStatus: 'NORMAL' | 'REVIEW' | 'ANOMALOUS SIGNAL';
  anomalyFlags: string[];
  isFork?: boolean;
  sparkline: number[]; // 7 data points representing weekly momentum curve
  createdAt: string;
  pushedAt: string;
}

export interface TrendingDataset {
  updatedAt: string;
  dataSource?: 'LIVE_GITHUB_INGESTION' | 'DETERMINISTIC_DEVELOPMENT_BASELINE';
  isBaselineSeed?: boolean;
  totalRepos: number;
  repositories: NormalizedTrendingRepo[];
  languages: string[];
  risingCount: number;
  hiddenGemsCount: number;
  anomalousCount: number;
}

export interface ArchiveDayFile {
  date: string; // YYYY-MM-DD (UTC)
  updatedAt: string;
  dataSource: 'LIVE_GITHUB_INGESTION' | 'DB_BACKFILL' | 'DETERMINISTIC_DEVELOPMENT_BASELINE';
  totalRepos: number;
  repositories: NormalizedTrendingRepo[];
}

export function archivePathForDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return path.join(process.cwd(), 'public', 'data', 'archive', y, m, `${d}.json`);
}

export function utcDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Writes (idempotently) today's archive snapshot:
 * public/data/archive/YYYY/MM/DD.json — top 100 repos by velocity.
 * Same-day ETL runs overwrite the file. Zero manual input.
 */
export function writeDailyArchiveSnapshot(
  normalizedRepos: NormalizedTrendingRepo[],
  liveDataSource: ArchiveDayFile['dataSource'] = 'LIVE_GITHUB_INGESTION'
): void {
  const dateStr = utcDateString();
  const ranked = [...normalizedRepos]
    .filter((r) => r.anomalyStatus !== 'ANOMALOUS SIGNAL')
    .sort((a, b) => b.velocityScore - a.velocityScore)
    .slice(0, 100);

  const file: ArchiveDayFile = {
    date: dateStr,
    updatedAt: new Date().toISOString(),
    dataSource: liveDataSource,
    totalRepos: ranked.length,
    repositories: ranked,
  };

  const outPath = archivePathForDate(dateStr);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(file), 'utf8');
  console.log(`🗄️  Archive snapshot written: public/data/archive/${dateStr.replace(/-/g, '/')}.json (${ranked.length} repos)`);
}

/**
 * Backfills archive files for past days from the Postgres velocity history
 * (repository_snapshots joined with repositories). Only writes dates that do
 * not already have an archive file. Runs inside the ETL where DATABASE_URL
 * is configured; guarded and non-fatal so it never breaks the 6h pipeline.
 */
export async function backfillArchiveFromDb(): Promise<void> {
  const pool = getDbPool();
  if (!pool) {
    console.log('🗄️  Archive backfill skipped: DATABASE_URL not configured.');
    return;
  }

  const client = await pool.connect();
  try {
    const { rows: dateRows } = await client.query(
      `SELECT DISTINCT snapshot_date FROM repository_snapshots
       WHERE snapshot_date >= CURRENT_DATE - INTERVAL '90 days'
       ORDER BY snapshot_date DESC`
    );

    let backfilled = 0;
    for (const { snapshot_date } of dateRows) {
      const dateStr =
        snapshot_date instanceof Date
          ? snapshot_date.toISOString().slice(0, 10)
          : String(snapshot_date).slice(0, 10);
      const outPath = archivePathForDate(dateStr);
      if (fs.existsSync(outPath)) continue; // idempotent — never overwrite

      const { rows } = await client.query(
        `SELECT r.id, r.owner, r.name, r.full_name, r.description,
                r.primary_language, r.topics, r.open_issues_count,
                r.created_at, r.pushed_at,
                s.stars_count, s.forks_count,
                COALESCE(s.stars_count - prev.stars_count, 0) AS stars_gained
         FROM repository_snapshots s
         JOIN repositories r ON r.id = s.repository_id
         LEFT JOIN repository_snapshots prev
           ON prev.repository_id = s.repository_id
          AND prev.snapshot_date = s.snapshot_date - INTERVAL '1 day'
         WHERE s.snapshot_date = $1
         ORDER BY s.stars_count DESC
         LIMIT 100`,
        [dateStr]
      );

      if (rows.length === 0) continue;

      const repositories: NormalizedTrendingRepo[] = rows.map((row: any) => ({
        id: Number(row.id),
        owner: row.owner,
        name: row.name,
        fullName: row.full_name,
        description: row.description || '',
        url: `https://github.com/${row.full_name}`,
        language: row.primary_language || 'Unknown',
        languageColor: '',
        topics: Array.isArray(row.topics) ? row.topics : [],
        totalStars: Number(row.stars_count),
        forksCount: Number(row.forks_count),
        openIssuesCount: Number(row.open_issues_count || 0),
        starsGainedToday: Math.max(0, Number(row.stars_gained || 0)),
        starsGainedWeek: 0,
        starsGainedMonth: 0,
        velocityScore: Math.max(0, Number(row.stars_gained || 0)),
        breakoutScore: 0,
        isRising: false,
        isHiddenGem: false,
        anomalyScore: 0,
        anomalyStatus: 'NORMAL' as const,
        anomalyFlags: [],
        isFork: false,
        sparkline: [],
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
        pushedAt: row.pushed_at ? new Date(row.pushed_at).toISOString() : '',
      }));

      const file: ArchiveDayFile = {
        date: dateStr,
        updatedAt: new Date().toISOString(),
        dataSource: 'DB_BACKFILL',
        totalRepos: repositories.length,
        repositories,
      };

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(file), 'utf8');
      backfilled++;
      console.log(`🗄️  Backfilled archive for ${dateStr} (${repositories.length} repos)`);
    }

    console.log(
      backfilled === 0
        ? '🗄️  Archive backfill: nothing to do (all recent dates already archived).'
        : `🗄️  Archive backfill complete: ${backfilled} day(s) backfilled.`
    );
  } finally {
    client.release();
  }
}

async function runEtl() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🚀 GitHub Trend Engine ETL Pipeline Started');
  console.log('====================================================');

  const client = new GitHubGraphQLClient();
  const rawCandidateMap = new Map<number, RawRepoNode>();
  let pointsSpent = 0;
  let remainingPoints = 5000;

  let isBaselineSeed = false;
  let dataSource: 'LIVE_GITHUB_INGESTION' | 'DETERMINISTIC_DEVELOPMENT_BASELINE' = 'LIVE_GITHUB_INGESTION';

  if (client.hasToken()) {
    console.log('🔑 Authenticated with GitHub Token. Fetching active candidates via GraphQL...');

    // 1. Overall breakout candidates (created or updated recently with high velocity)
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await client.fetchBatch(`created:>${sevenDaysAgo} stars:>30 sort:stars-desc`, null, 50);
      if (res.rateLimit) {
        pointsSpent += res.rateLimit.cost;
        remainingPoints = res.rateLimit.remaining;
      }
      res.data.search.nodes.forEach((node) => rawCandidateMap.set(node.databaseId, node));
      console.log(`[INGEST] Overall top breakouts: ${res.data.search.nodes.length} repos`);
    } catch (e: any) {
      console.warn(`[INGEST_WARNING] Overall query skipped:`, e.message);
    }

    // 2. Language-specific candidates across 10 major languages
    for (const lang of LANGUAGES_TO_TRACK) {
      try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res = await client.fetchBatch(`pushed:>${threeDaysAgo} language:${lang} stars:>20 sort:stars-desc`, null, 50);
        if (res.rateLimit) {
          pointsSpent += res.rateLimit.cost;
          remainingPoints = res.rateLimit.remaining;
        }
        res.data.search.nodes.forEach((node) => rawCandidateMap.set(node.databaseId, node));
        console.log(`[INGEST] Language ${lang}: +${res.data.search.nodes.length} repos (Pool total: ${rawCandidateMap.size})`);
      } catch (e: any) {
        console.warn(`[INGEST_WARNING] Language ${lang} query skipped:`, e.message);
      }
    }
  } else {
    console.warn('⚠️ GITHUB_TOKEN not detected in environment.');
    console.warn('Loading deterministic development baseline dataset (DEVELOPMENT/STAGING MODE)...');
    isBaselineSeed = true;
    dataSource = 'DETERMINISTIC_DEVELOPMENT_BASELINE';
  }

  // If no candidates were fetched (e.g. running offline or no token), initialize high-quality real seeds
  let rawCandidates = Array.from(rawCandidateMap.values());
  if (rawCandidates.length === 0) {
    rawCandidates = generateBaselineSeedData();
    isBaselineSeed = true;
    dataSource = 'DETERMINISTIC_DEVELOPMENT_BASELINE';
    console.log(`[BASELINE_SEED] Initialized ${rawCandidates.length} high-fidelity baseline repositories.`);
  }

  console.log(`\n📊 Total unique repositories to score & rank: ${rawCandidates.length}`);

  // Ranking & Anomaly Scoring
  const velocityLogStrategy = new VelocityLogStrategy();
  const breakoutStrategy = new BreakoutStrategy();

  // If database is configured, load previous snapshot metrics for true differentials
  const historicalMetricsMap = new Map<number, {
    starsGainedToday: number;
    starsGainedWeek: number;
    starsGainedMonth: number;
    sparkline: number[];
  }>();

  const pool = isDatabaseConfigured() ? getDbPool() : null;

  if (pool) {
    let dbClient: any = null;
    try {
      dbClient = await pool.connect();
      console.log('💾 Connected to PostgreSQL. Computing true deltas from snapshot history...');
      const candidateIds = rawCandidates.map((n) => n.databaseId);
      const allSnapsRes = await dbClient.query(
        `SELECT repository_id, stars_count, snapshot_date::text as snapshot_date 
         FROM repository_snapshots 
         WHERE repository_id = ANY($1) 
         ORDER BY snapshot_date DESC`,
        [candidateIds]
      );

      const snapsByRepo = new Map<number, { stars_count: number; snapshot_date: string }[]>();
      for (const row of allSnapsRes.rows) {
        const repoId = Number(row.repository_id);
        let list = snapsByRepo.get(repoId);
        if (!list) {
          list = [];
          snapsByRepo.set(repoId, list);
        }
        list.push({
          stars_count: Number(row.stars_count),
          snapshot_date: String(row.snapshot_date).split('T')[0],
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const sevenDaysAgoDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const thirtyDaysAgoDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      for (const node of rawCandidates) {
        const repoSnaps = snapsByRepo.get(node.databaseId) || [];
        const prevSnap = repoSnaps.find((s) => s.snapshot_date < todayStr);
        const weekSnap = repoSnaps.find((s) => s.snapshot_date <= sevenDaysAgoDate);
        const monthSnap = repoSnaps.find((s) => s.snapshot_date <= thirtyDaysAgoDate);
        const sparkSnaps = repoSnaps.slice(0, 7);

        let starsGainedToday = 0;
        let starsGainedWeek = 0;
        let starsGainedMonth = 0;
        let sparkline: number[] = [];

        if (prevSnap) {
          starsGainedToday = Math.max(0, node.stargazerCount - prevSnap.stars_count);
        } else if (node.baselineMetrics) {
          starsGainedToday = node.baselineMetrics.starsGainedToday;
        }

        if (weekSnap) {
          starsGainedWeek = Math.max(0, node.stargazerCount - weekSnap.stars_count);
        } else if (node.baselineMetrics) {
          starsGainedWeek = node.baselineMetrics.starsGainedWeek;
        } else {
          starsGainedWeek = starsGainedToday;
        }

        if (monthSnap) {
          starsGainedMonth = Math.max(0, node.stargazerCount - monthSnap.stars_count);
        } else if (node.baselineMetrics) {
          starsGainedMonth = node.baselineMetrics.starsGainedMonth;
        } else {
          starsGainedMonth = starsGainedWeek;
        }

        if (sparkSnaps.length >= 2) {
          sparkline = sparkSnaps.map((r) => r.stars_count).reverse();
        } else if (node.baselineMetrics) {
          sparkline = node.baselineMetrics.sparkline;
        } else {
          sparkline = [node.stargazerCount];
        }

        historicalMetricsMap.set(node.databaseId, {
          starsGainedToday,
          starsGainedWeek,
          starsGainedMonth,
          sparkline,
        });
      }
    } catch (dbErr: any) {
      console.error('❌ Failed to fetch snapshot differentials from DB:', dbErr.message);
      console.warn('⚠️ Falling back to deterministic baseline metrics...');
    } finally {
      if (dbClient) dbClient.release();
    }
  }

  const normalizedRepos: NormalizedTrendingRepo[] = rawCandidates.map((node) => {
    const historical = historicalMetricsMap.get(node.databaseId);
    const starsGainedToday = historical?.starsGainedToday ?? node.baselineMetrics?.starsGainedToday ?? 0;
    const starsGainedWeek = historical?.starsGainedWeek ?? node.baselineMetrics?.starsGainedWeek ?? starsGainedToday;
    const starsGainedMonth = historical?.starsGainedMonth ?? node.baselineMetrics?.starsGainedMonth ?? starsGainedWeek;
    const sparkline = historical?.sparkline ?? node.baselineMetrics?.sparkline ?? [node.stargazerCount];

    const velocityScore = velocityLogStrategy.calculate({
      repositoryId: node.databaseId,
      totalStars: node.stargazerCount,
      deltaStars: starsGainedToday,
      forksCount: node.forkCount,
      hoursElapsed: 24,
    }).score;

    const breakoutScore = breakoutStrategy.calculate({
      repositoryId: node.databaseId,
      totalStars: node.stargazerCount,
      deltaStars: starsGainedToday,
      forksCount: node.forkCount,
      hoursElapsed: 24,
    }).score;

    const isRising = breakoutScore > 15 && node.stargazerCount < 10000;
    const isGem = isHiddenGem({
      totalStars: node.stargazerCount,
      deltaStars: starsGainedToday,
      forksCount: node.forkCount,
      description: node.description || undefined,
    });

    const anomalyEval = AnomalyDetector.evaluate({
      starsGained24h: starsGainedToday,
      totalStars: node.stargazerCount,
      forksCount: node.forkCount,
      issuesCount: node.openIssues?.totalCount || 0,
      ownerCreatedAt: node.owner.createdAt,
      lastPushedAt: node.pushedAt,
    });

    const topics = node.repositoryTopics?.nodes?.map((n) => n.topic.name) || [];

    return {
      id: node.databaseId,
      owner: node.owner.login,
      name: node.name,
      fullName: node.nameWithOwner,
      description: node.description || 'Open-source software repository with active community momentum.',
      url: node.url,
      language: node.primaryLanguage?.name || 'TypeScript',
      languageColor: node.primaryLanguage?.color || '#3178c6',
      topics: topics.slice(0, 5),
      totalStars: node.stargazerCount,
      forksCount: node.forkCount,
      openIssuesCount: node.openIssues?.totalCount || 0,
      starsGainedToday,
      starsGainedWeek,
      starsGainedMonth,
      velocityScore,
      breakoutScore,
      isRising,
      isHiddenGem: isGem,
      anomalyScore: anomalyEval.score,
      anomalyStatus: anomalyEval.status,
      anomalyFlags: anomalyEval.flags,
      isFork: node.isFork ?? false,
      sparkline,
      createdAt: node.createdAt,
      pushedAt: node.pushedAt,
    };
  });

  // Sort by velocity score descending
  normalizedRepos.sort((a, b) => b.velocityScore - a.velocityScore);

  // Database persistence (if DATABASE_URL is configured)
  if (pool) {
    let client: any = null;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const reposToSave = normalizedRepos.slice(0, 500);
      console.log(`💾 Syncing ${reposToSave.length} repositories to PostgreSQL in optimized batches...`);
      const chunkSize = 25;

      for (let i = 0; i < reposToSave.length; i += chunkSize) {
        const chunk = reposToSave.slice(i, i + chunkSize);

        // 1. Bulk upsert master repository records
        const repoValues: any[] = [];
        const repoPlaceholders = chunk.map((r, idx) => {
          const offset = idx * 12;
          repoValues.push(
            r.id,
            r.owner,
            r.name,
            r.fullName,
            r.description,
            r.language,
            r.topics,
            r.totalStars,
            r.forksCount,
            r.openIssuesCount,
            r.createdAt,
            r.pushedAt
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, NOW())`;
        });

        await client.query(
          `INSERT INTO repositories (
              id, owner, name, full_name, description, primary_language,
              topics, total_stars, forks_count, open_issues_count,
              created_at, pushed_at, last_updated
           ) VALUES ${repoPlaceholders.join(', ')}
           ON CONFLICT (id) DO UPDATE SET
              description = EXCLUDED.description,
              primary_language = EXCLUDED.primary_language,
              topics = EXCLUDED.topics,
              total_stars = EXCLUDED.total_stars,
              forks_count = EXCLUDED.forks_count,
              open_issues_count = EXCLUDED.open_issues_count,
              pushed_at = EXCLUDED.pushed_at,
              last_updated = NOW()`,
          repoValues
        );

        // 2. Bulk upsert daily snapshots
        const snapValues: any[] = [];
        const snapPlaceholders = chunk.map((r, idx) => {
          const offset = idx * 3;
          snapValues.push(r.id, r.totalStars, r.forksCount);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, CURRENT_DATE, NOW())`;
        });

        await client.query(
          `INSERT INTO repository_snapshots (
              repository_id, stars_count, forks_count, snapshot_date, recorded_at
           ) VALUES ${snapPlaceholders.join(', ')}
           ON CONFLICT (repository_id, snapshot_date) DO UPDATE SET
              stars_count = EXCLUDED.stars_count,
              forks_count = EXCLUDED.forks_count,
              recorded_at = NOW()`,
          snapValues
        );

        // 3. Bulk upsert trending leaderboard
        const leaderValues: any[] = [];
        const leaderPlaceholders = chunk.map((r, idx) => {
          const offset = idx * 6;
          leaderValues.push(r.id, r.starsGainedToday, r.velocityScore, r.breakoutScore, r.anomalyScore, r.anomalyStatus);
          return `($${offset + 1}, 'daily', $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, NOW())`;
        });

        await client.query(
          `INSERT INTO trending_leaderboard (
              repository_id, time_window, stars_gained, rank_score,
              breakout_score, anomaly_score, anomaly_status, calculated_at
           ) VALUES ${leaderPlaceholders.join(', ')}
           ON CONFLICT (repository_id, time_window) DO UPDATE SET
              stars_gained = EXCLUDED.stars_gained,
              rank_score = EXCLUDED.rank_score,
              breakout_score = EXCLUDED.breakout_score,
              anomaly_score = EXCLUDED.anomaly_score,
              anomaly_status = EXCLUDED.anomaly_status,
              calculated_at = NOW()`,
          leaderValues
        );
      }

      await client.query('COMMIT');
      console.log('✅ PostgreSQL database sync complete!');
    } catch (dbErr: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('❌ Database sync failed, transaction rolled back:', dbErr.message);
      console.warn('⚠️ Continuing with static dataset compilation...');
    } finally {
      if (client) client.release();
    }
  }

  // Static JSON precomputation (BestOfJS pattern for $0 edge delivery)
  const outputDataset: TrendingDataset = {
    updatedAt: new Date().toISOString(),
    dataSource,
    isBaselineSeed,
    totalRepos: normalizedRepos.length,
    repositories: normalizedRepos.slice(0, 500),
    languages: Array.from(new Set(normalizedRepos.map((r) => r.language))).sort(),
    risingCount: normalizedRepos.filter(isVerifiedRising).length,
    hiddenGemsCount: normalizedRepos.filter(isVerifiedHiddenGem).length,
    anomalousCount: normalizedRepos.filter((r) => r.anomalyStatus === 'ANOMALOUS SIGNAL').length,
  };

  const outputPath = path.join(process.cwd(), 'public', 'data', 'trending-summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputDataset, null, 2), 'utf8');
  console.log(`📦 Compiled static dataset to: ${outputPath}`);

  // Daily archive snapshot (Gap #3): idempotent per-day file at
  // public/data/archive/YYYY/MM/DD.json. Same-day ETL runs overwrite it.
  // Fully automatic — no manual input. Powers /archive pages.
  try {
    writeDailyArchiveSnapshot(normalizedRepos, dataSource);
  } catch (archiveErr: any) {
    console.error('❌ Archive snapshot failed (non-fatal):', archiveErr?.message || archiveErr);
  }

  // Backfill archive files for past days from Postgres velocity history
  // (repository_snapshots). Runs only when DATABASE_URL is configured
  // (i.e. inside the GitHub Actions ETL, not local builds). Non-fatal.
  if (isDatabaseConfigured()) {
    try {
      await backfillArchiveFromDb();
    } catch (backfillErr: any) {
      console.error('❌ Archive backfill failed (non-fatal):', backfillErr?.message || backfillErr);
    }
  }

  // Automated "Picks of the Day" + RSS feed (zero manual input)
  try {
    const { generateDailyPicks } = await import('./generate-picks');
    generateDailyPicks(outputDataset);
  } catch (pickErr: any) {
    console.error('❌ Picks generation failed (non-fatal):', pickErr?.message || pickErr);
  }

  // Self-commit the generated picks + RSS so they reach the repo.
  // (The workflow's commit step only stages trending-summary.json, and the
  // workflow file itself is intentionally left untouched.)
  if (process.env.GITHUB_ACTIONS === 'true') {
    try {
      const { execSync } = await import('child_process');
      const git = (args: string) =>
        execSync(`git ${args}`, { cwd: process.cwd(), stdio: 'pipe' }).toString().trim();
      git('add public/data/picks.json public/picks.xml public/data/archive');
      let staged = false;
      try {
        git('diff --staged --quiet');
      } catch {
        staged = true; // non-zero exit = there are staged changes
      }
      if (staged) {
        git(
          '-c user.name="github-actions[bot]" -c user.email="github-actions[bot]@users.noreply.github.com" ' +
            'commit -m "chore(data): auto-update picks + RSS + archive [skip ci]"'
        );
        git('push');
        console.log('📌 Committed + pushed auto picks, RSS feed and archive snapshots');
      } else {
        console.log('📌 Picks unchanged — nothing to commit');
      }
    } catch (gitErr: any) {
      console.error('❌ Picks self-commit failed (non-fatal):', gitErr?.message || gitErr);
    }
  }

  if (pool) {
    try {
      await pool.end();
    } catch {}
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n====================================================');
  console.log('✨ ETL Pipeline Completed Successfully');
  console.log(`⏱️ Duration: ${durationSec}s`);
  console.log(`🎯 Top ${Math.min(normalizedRepos.length, 500)} Repositories Ranked & Saved`);
  console.log(`📊 GraphQL Points Spent: ${pointsSpent} | Remaining: ${remainingPoints}`);
  console.log('====================================================\n');
}

function generateBaselineSeedData(): RawRepoNode[] {
  return [
    {
      databaseId: 101,
      nameWithOwner: 'Anil-matcha/awesome-generative-ai-apps',
      name: 'awesome-generative-ai-apps',
      owner: { login: 'Anil-matcha', avatarUrl: 'https://github.com/Anil-matcha.png', createdAt: '2020-03-15T00:00:00Z' },
      description: '50+ open-source generative AI apps you can clone, deploy, and monetize — image generators, video tools, virtual try-ons, and AI SaaS templates.',
      url: 'https://github.com/Anil-matcha/awesome-generative-ai-apps',
      stargazerCount: 3320,
      forkCount: 471,
      openIssues: { totalCount: 12 },
      primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
      repositoryTopics: { nodes: [{ topic: { name: 'generative-ai' } }, { topic: { name: 'ai-agents' } }, { topic: { name: 'nextjs' } }] },
      createdAt: '2024-02-10T00:00:00Z',
      pushedAt: '2026-09-18T10:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 95,
        starsGainedWeek: 480,
        starsGainedMonth: 1350,
        sparkline: [40, 55, 65, 75, 80, 88, 95],
      },
    },
    {
      databaseId: 102,
      nameWithOwner: 'cloudflare/security-audit-skill',
      name: 'security-audit-skill',
      owner: { login: 'cloudflare', avatarUrl: 'https://github.com/cloudflare.png', createdAt: '2011-01-01T00:00:00Z' },
      description: 'A coding-agent skill for multi-phase security audits with independently verified, machine-readable findings.',
      url: 'https://github.com/cloudflare/security-audit-skill',
      stargazerCount: 10840,
      forkCount: 573,
      openIssues: { totalCount: 9 },
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      repositoryTopics: { nodes: [{ topic: { name: 'security' } }, { topic: { name: 'audit' } }, { topic: { name: 'agents' } }] },
      createdAt: '2026-01-20T00:00:00Z',
      pushedAt: '2026-09-18T12:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 280,
        starsGainedWeek: 1450,
        starsGainedMonth: 4100,
        sparkline: [120, 150, 180, 220, 240, 260, 280],
      },
    },
    {
      databaseId: 103,
      nameWithOwner: 'alibaba/open-code-review',
      name: 'open-code-review',
      owner: { login: 'alibaba', avatarUrl: 'https://github.com/alibaba.png', createdAt: '2012-05-15T00:00:00Z' },
      description: 'Hybrid architecture code review tool: deterministic pipelines + LLM Agent, line-level comments, built-in multi-language ruleset.',
      url: 'https://github.com/alibaba/open-code-review',
      stargazerCount: 36320,
      forkCount: 2610,
      openIssues: { totalCount: 45 },
      primaryLanguage: { name: 'Go', color: '#00ADD8' },
      repositoryTopics: { nodes: [{ topic: { name: 'code-review' } }, { topic: { name: 'llm' } }, { topic: { name: 'golang' } }] },
      createdAt: '2024-05-01T00:00:00Z',
      pushedAt: '2026-09-18T14:30:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 450,
        starsGainedWeek: 2100,
        starsGainedMonth: 6200,
        sparkline: [210, 260, 310, 380, 410, 430, 450],
      },
    },
    {
      databaseId: 104,
      nameWithOwner: 'hypit-ai/hypit',
      name: 'hypit',
      owner: { login: 'hypit-ai', avatarUrl: 'https://github.com/hypit-ai.png', createdAt: '2025-06-10T00:00:00Z' },
      description: 'Clone viral video formats with AI agents. Swap face, voice, b-roll, generate 100 variants in one command with ffmpeg automation.',
      url: 'https://github.com/hypit-ai/hypit',
      stargazerCount: 9810,
      forkCount: 1205,
      openIssues: { totalCount: 18 },
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      repositoryTopics: { nodes: [{ topic: { name: 'video' } }, { topic: { name: 'ai' } }, { topic: { name: 'ffmpeg' } }] },
      createdAt: '2026-02-14T00:00:00Z',
      pushedAt: '2026-09-18T16:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 210,
        starsGainedWeek: 980,
        starsGainedMonth: 2800,
        sparkline: [80, 110, 140, 160, 180, 195, 210],
      },
    },
    {
      databaseId: 105,
      nameWithOwner: 'deepseek-ai/deepseek-harness',
      name: 'deepseek-harness',
      owner: { login: 'deepseek-ai', avatarUrl: 'https://github.com/deepseek-ai.png', createdAt: '2023-11-01T00:00:00Z' },
      description: 'High-throughput reasoning evaluation harness and inference pipeline optimizations for deep reasoning models.',
      url: 'https://github.com/deepseek-ai/deepseek-harness',
      stargazerCount: 14200,
      forkCount: 1890,
      openIssues: { totalCount: 22 },
      primaryLanguage: { name: 'Python', color: '#3572A5' },
      repositoryTopics: { nodes: [{ topic: { name: 'llm' } }, { topic: { name: 'reasoning' } }, { topic: { name: 'evaluation' } }] },
      createdAt: '2025-08-12T00:00:00Z',
      pushedAt: '2026-09-18T18:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 340,
        starsGainedWeek: 1800,
        starsGainedMonth: 5200,
        sparkline: [180, 210, 250, 280, 300, 320, 340],
      },
    },
    {
      databaseId: 106,
      nameWithOwner: 'astral-sh/uv',
      name: 'uv',
      owner: { login: 'astral-sh', avatarUrl: 'https://github.com/astral-sh.png', createdAt: '2023-01-10T00:00:00Z' },
      description: 'An extremely fast Python package and project manager, written in Rust.',
      url: 'https://github.com/astral-sh/uv',
      stargazerCount: 42100,
      forkCount: 1450,
      openIssues: { totalCount: 130 },
      primaryLanguage: { name: 'Rust', color: '#dea584' },
      repositoryTopics: { nodes: [{ topic: { name: 'python' } }, { topic: { name: 'package-manager' } }, { topic: { name: 'rust' } }] },
      createdAt: '2024-02-01T00:00:00Z',
      pushedAt: '2026-09-18T19:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 520,
        starsGainedWeek: 2800,
        starsGainedMonth: 8400,
        sparkline: [310, 350, 390, 440, 470, 500, 520],
      },
    },
    {
      databaseId: 107,
      nameWithOwner: 'shadcn/ui',
      name: 'ui',
      owner: { login: 'shadcn', avatarUrl: 'https://github.com/shadcn.png', createdAt: '2015-08-20T00:00:00Z' },
      description: 'A set of beautifully-designed, accessible components and a code distribution platform. Works with your favorite frameworks.',
      url: 'https://github.com/shadcn/ui',
      stargazerCount: 89400,
      forkCount: 7890,
      openIssues: { totalCount: 110 },
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      repositoryTopics: { nodes: [{ topic: { name: 'react' } }, { topic: { name: 'tailwind' } }, { topic: { name: 'components' } }] },
      createdAt: '2023-01-15T00:00:00Z',
      pushedAt: '2026-09-18T20:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 410,
        starsGainedWeek: 2300,
        starsGainedMonth: 7100,
        sparkline: [260, 290, 320, 350, 370, 390, 410],
      },
    },
    {
      databaseId: 108,
      nameWithOwner: 'ollama/ollama',
      name: 'ollama',
      owner: { login: 'ollama', avatarUrl: 'https://github.com/ollama.png', createdAt: '2023-06-01T00:00:00Z' },
      description: 'Get up and running with Llama 3.3, Mistral, Gemma 2, and other large language models locally.',
      url: 'https://github.com/ollama/ollama',
      stargazerCount: 112000,
      forkCount: 9400,
      openIssues: { totalCount: 350 },
      primaryLanguage: { name: 'Go', color: '#00ADD8' },
      repositoryTopics: { nodes: [{ topic: { name: 'ai' } }, { topic: { name: 'llm' } }, { topic: { name: 'local-ai' } }] },
      createdAt: '2023-06-15T00:00:00Z',
      pushedAt: '2026-09-18T21:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 680,
        starsGainedWeek: 3900,
        starsGainedMonth: 11500,
        sparkline: [450, 490, 530, 580, 610, 640, 680],
      },
    },
    {
      databaseId: 109,
      nameWithOwner: 'vllm-project/vllm',
      name: 'vllm',
      owner: { login: 'vllm-project', avatarUrl: 'https://github.com/vllm-project.png', createdAt: '2023-04-01T00:00:00Z' },
      description: 'A high-throughput and memory-efficient inference and serving engine for LLMs with PagedAttention.',
      url: 'https://github.com/vllm-project/vllm',
      stargazerCount: 39500,
      forkCount: 5200,
      openIssues: { totalCount: 280 },
      primaryLanguage: { name: 'Python', color: '#3572A5' },
      repositoryTopics: { nodes: [{ topic: { name: 'inference' } }, { topic: { name: 'cuda' } }, { topic: { name: 'pagedattention' } }] },
      createdAt: '2023-04-10T00:00:00Z',
      pushedAt: '2026-09-18T22:00:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 290,
        starsGainedWeek: 1600,
        starsGainedMonth: 4800,
        sparkline: [170, 200, 220, 250, 270, 280, 290],
      },
    },
    {
      databaseId: 110,
      nameWithOwner: 'gemini-cli/gemini-kit',
      name: 'gemini-kit',
      owner: { login: 'gemini-cli', avatarUrl: 'https://github.com/google.png', createdAt: '2024-01-01T00:00:00Z' },
      description: 'Lightweight command-line toolkit for multi-modal agent workflows and automated local development.',
      url: 'https://github.com/gemini-cli/gemini-kit',
      stargazerCount: 840,
      forkCount: 42,
      openIssues: { totalCount: 3 },
      primaryLanguage: { name: 'Rust', color: '#dea584' },
      repositoryTopics: { nodes: [{ topic: { name: 'cli' } }, { topic: { name: 'agent' } }, { topic: { name: 'gemini' } }] },
      createdAt: '2026-04-01T00:00:00Z',
      pushedAt: '2026-09-18T22:30:00Z',
      isArchived: false,
      isFork: false,
      baselineMetrics: {
        starsGainedToday: 48,
        starsGainedWeek: 260,
        starsGainedMonth: 720,
        sparkline: [20, 25, 30, 38, 42, 45, 48],
      },
    },
  ];
}

runEtl().catch((err) => {
  console.error('[ETL_FATAL_ERROR]', err);
  process.exit(1);
});
