import test from 'node:test';
import assert from 'node:assert';
import {
  calculateOrganicTrustScore,
  calculateGrowthAcceleration,
  calculateMaintenanceVitality,
} from '../src/engine/repo-intelligence';
import { NormalizedTrendingRepo } from '../scripts/run-trend-etl';

function mockRepo(overrides: Partial<NormalizedTrendingRepo> = {}): NormalizedTrendingRepo {
  return {
    id: 1001,
    owner: 'testowner',
    name: 'testrepo',
    fullName: 'testowner/testrepo',
    description: 'A test repository',
    url: 'https://github.com/testowner/testrepo',
    language: 'TypeScript',
    languageColor: '#3178c6',
    topics: ['testing', 'ai'],
    totalStars: 1000,
    forksCount: 100, // 10% ratio
    openIssuesCount: 15,
    starsGainedToday: 50,
    starsGainedWeek: 350,
    starsGainedMonth: 1200,
    velocityScore: 10,
    breakoutScore: 5,
    isRising: true,
    isHiddenGem: false,
    anomalyScore: 0,
    anomalyStatus: 'NORMAL',
    anomalyFlags: [],
    sparkline: [10, 20, 30, 40, 50, 60, 50],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days old
    pushedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    ...overrides,
  };
}

test('Repo Intelligence: Invariant 1 - Organic Trust Score is strictly bounded [5, 100]', () => {
  // Ultra-stellar repo
  const stellar = mockRepo({
    forksCount: 500, // 50% forks
    anomalyStatus: 'NORMAL',
    openIssuesCount: 50,
  });
  const resStellar = calculateOrganicTrustScore(stellar);
  assert.ok(resStellar.score <= 100, 'Score should never exceed 100');
  assert.strictEqual(resStellar.grade, 'A+');

  // Ultra-toxic / bot-farmed repo
  const botSpike = mockRepo({
    totalStars: 5000,
    forksCount: 2, // 0.04% fork ratio
    anomalyStatus: 'ANOMALOUS SIGNAL',
    anomalyFlags: ['EXTREME_STAR_SURGE', 'LOW_FORK_RATIO'],
    openIssuesCount: 0,
  });
  const resBot = calculateOrganicTrustScore(botSpike);
  assert.ok(resBot.score >= 5, 'Score should never drop below 5');
  assert.strictEqual(resBot.grade, 'F');
});

test('Repo Intelligence: Invariant 2 - Anomalous Signal repos can NEVER receive A or A+ grade', () => {
  const anomalousRepo = mockRepo({
    forksCount: 300,
    anomalyStatus: 'ANOMALOUS SIGNAL',
    anomalyFlags: ['UNNATURAL_GROWTH_CURVE'],
  });
  const res = calculateOrganicTrustScore(anomalousRepo);
  assert.notStrictEqual(res.grade, 'A');
  assert.notStrictEqual(res.grade, 'A+');
  assert.ok(res.grade === 'C' || res.grade === 'F');
});

test('Repo Intelligence: Invariant 3 - Synthetic low-fork ratio incurs penalty on large repos', () => {
  const healthy = mockRepo({ totalStars: 2000, forksCount: 200 }); // 10% forks
  const synthetic = mockRepo({ totalStars: 2000, forksCount: 5 }); // 0.25% forks

  const resHealthy = calculateOrganicTrustScore(healthy);
  const resSynthetic = calculateOrganicTrustScore(synthetic);

  assert.ok(resHealthy.score > resSynthetic.score, 'Healthy fork ratio should score strictly higher');
  assert.ok(resSynthetic.signals.some((s) => s.includes('Low Fork-to-Star Ratio')));
});

test('Repo Intelligence: Invariant 4 - Growth Acceleration matches discrete difference', () => {
  // today = 50, week = 350 -> avg = 50, acceleration = 0
  const steady = mockRepo({ starsGainedToday: 50, starsGainedWeek: 350 });
  const resSteady = calculateGrowthAcceleration(steady);
  assert.strictEqual(resSteady.status, 'STEADY');
  assert.strictEqual(resSteady.acceleration, 0);

  // today = 100, week = 350 -> avg = 50, acceleration = +50
  const accelerating = mockRepo({ starsGainedToday: 100, starsGainedWeek: 350 });
  const resAccel = calculateGrowthAcceleration(accelerating);
  assert.strictEqual(resAccel.status, 'ACCELERATING');
  assert.strictEqual(resAccel.acceleration, 50);

  // today = 10, week = 350 -> avg = 50, acceleration = -40
  const cooling = mockRepo({ starsGainedToday: 10, starsGainedWeek: 350 });
  const resCooling = calculateGrowthAcceleration(cooling);
  assert.strictEqual(resCooling.status, 'COOLING');
  assert.strictEqual(resCooling.acceleration, -40);
});

test('Repo Intelligence: Invariant 5 - Maintenance Vitality reflects commit recency', () => {
  const hyperActive = mockRepo({
    pushedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });
  assert.strictEqual(calculateMaintenanceVitality(hyperActive).cadence, 'HYPER-ACTIVE');

  const active = mockRepo({
    pushedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  });
  assert.strictEqual(calculateMaintenanceVitality(active).cadence, 'ACTIVE');

  const dormant = mockRepo({
    pushedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  });
  assert.strictEqual(calculateMaintenanceVitality(dormant).cadence, 'DORMANT');
});
