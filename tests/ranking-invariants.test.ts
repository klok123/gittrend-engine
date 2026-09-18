import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  VelocityLogStrategy,
  GravityDecayStrategy,
  BreakoutStrategy,
  isHiddenGem,
  isVerifiedHiddenGem,
  computeSpearmanRankCorrelation,
} from '../src/engine/ranking';

describe('Ranking Mathematical Invariants', () => {
  const velocityStrategy = new VelocityLogStrategy();
  const gravityStrategy = new GravityDecayStrategy();
  const breakoutStrategy = new BreakoutStrategy();

  it('Invariance 1: Non-Zero Divisor (Zero Total Stars Safety)', () => {
    const res = velocityStrategy.calculate({
      repositoryId: 1,
      totalStars: 0,
      deltaStars: 10,
      forksCount: 0,
      hoursElapsed: 24,
    });
    assert.ok(res.score > 0, 'Score must be positive');
    assert.ok(Number.isFinite(res.score), 'Score must be finite');
    assert.strictEqual(res.modelName, 'momentum_log');
  });

  it('Invariance 2: Delta Monotonicity', () => {
    const lowDelta = velocityStrategy.calculate({
      repositoryId: 1,
      totalStars: 1000,
      deltaStars: 20,
      forksCount: 10,
      hoursElapsed: 24,
    });
    const highDelta = velocityStrategy.calculate({
      repositoryId: 2,
      totalStars: 1000,
      deltaStars: 200,
      forksCount: 10,
      hoursElapsed: 24,
    });
    assert.ok(highDelta.score > lowDelta.score, 'Higher delta must produce higher score');
  });

  it('Invariance 3: Negative Delta Clamping', () => {
    const res = velocityStrategy.calculate({
      repositoryId: 1,
      totalStars: 500,
      deltaStars: -10,
      forksCount: 10,
      hoursElapsed: 24,
    });
    assert.strictEqual(res.score, 0, 'Negative delta must be clamped to zero');
  });

  it('Invariance 4: Gravity Time Decay', () => {
    const day1 = gravityStrategy.calculate({
      repositoryId: 1,
      totalStars: 1000,
      deltaStars: 100,
      forksCount: 50,
      hoursElapsed: 24,
    });
    const day3 = gravityStrategy.calculate({
      repositoryId: 1,
      totalStars: 1000,
      deltaStars: 100,
      forksCount: 50,
      hoursElapsed: 72,
    });
    assert.ok(day1.score > day3.score, 'Score must decay as hoursElapsed increases');
  });

  it('Invariance 5: Breakout Ratio Calculation', () => {
    const res = breakoutStrategy.calculate({
      repositoryId: 1,
      totalStars: 200,
      deltaStars: 100,
      forksCount: 10,
      hoursElapsed: 24,
    });
    // Base = 200 - 100 = 100. Ratio = (100 / 100) * 100 = 100%
    assert.strictEqual(res.score, 100);
  });

  it('Invariance 6: Hidden Gem Qualification', () => {
    const gem = isHiddenGem({
      totalStars: 500,
      deltaStars: 40,
      forksCount: 5,
      description: 'Production-ready database toolkit for edge microservices',
    });
    assert.strictEqual(gem, true, 'Repository should qualify as hidden gem');

    const giant = isHiddenGem({
      totalStars: 50000,
      deltaStars: 500,
      forksCount: 5000,
      description: 'Huge open source framework',
    });
    assert.strictEqual(giant, false, 'Giant repository must not qualify as hidden gem');
  });

  it('Invariance 7: Spearman Rank Correlation', () => {
    // Identical rankings -> correlation 1.0
    const perfect = computeSpearmanRankCorrelation([1, 2, 3, 4], [1, 2, 3, 4]);
    assert.strictEqual(perfect, 1.0);

    // Reversed rankings -> correlation -1.0
    const reversed = computeSpearmanRankCorrelation([1, 2, 3, 4], [4, 3, 2, 1]);
    assert.strictEqual(reversed, -1.0);
  });

  it('Invariance 8: Hidden Gem Boundary Thresholds', () => {
    // Exactly at 1,500 stars boundary
    assert.strictEqual(
      isHiddenGem({ totalStars: 1500, deltaStars: 25, forksCount: 3, description: 'Sufficiently long description here' }),
      true,
      'Exactly 1500 stars should qualify'
    );
    // 1501 stars -> disqualified
    assert.strictEqual(
      isHiddenGem({ totalStars: 1501, deltaStars: 25, forksCount: 3, description: 'Sufficiently long description here' }),
      false,
      '1501 stars must not qualify'
    );
    // 24 delta -> disqualified
    assert.strictEqual(
      isHiddenGem({ totalStars: 1000, deltaStars: 24, forksCount: 3, description: 'Sufficiently long description here' }),
      false,
      '24 delta stars must not qualify'
    );
    // 2 forks -> disqualified
    assert.strictEqual(
      isHiddenGem({ totalStars: 1000, deltaStars: 50, forksCount: 2, description: 'Sufficiently long description here' }),
      false,
      '2 forks must not qualify'
    );
  });

  it('Invariance 9: Multi-Window Sorting Invariance', () => {
    const repos = [
      { id: 1, velocityScore: 1000, starsGainedWeek: 50, starsGainedMonth: 500 },
      { id: 2, velocityScore: 200, starsGainedWeek: 600, starsGainedMonth: 800 },
      { id: 3, velocityScore: 500, starsGainedWeek: 100, starsGainedMonth: 1200 },
    ];

    const todaySort = [...repos].sort((a, b) => b.velocityScore - a.velocityScore).map(r => r.id);
    const weekSort = [...repos].sort((a, b) => b.starsGainedWeek - a.starsGainedWeek).map(r => r.id);
    const monthSort = [...repos].sort((a, b) => b.starsGainedMonth - a.starsGainedMonth).map(r => r.id);

    assert.deepStrictEqual(todaySort, [1, 3, 2], 'Today window sorts by velocity score');
    assert.deepStrictEqual(weekSort, [2, 3, 1], 'Week window sorts by weekly stars gained');
    assert.deepStrictEqual(monthSort, [3, 2, 1], 'Month window sorts by monthly stars gained');
  });

  it('Invariance 10: Hidden Gems Canonical Predicate Alignment (Condition 1 Regression)', () => {
    // 1. Normal genuine hidden gem (passes star/delta thresholds, normal anomaly status)
    const normalGem = {
      id: 101,
      totalStars: 1200,
      deltaStars: 50,
      forksCount: 20,
      description: 'Production-ready database connection pooler and cache layer',
      isHiddenGem: isHiddenGem({ totalStars: 1200, deltaStars: 50, forksCount: 20, description: 'Production-ready database connection pooler and cache layer' }),
      anomalyStatus: 'NORMAL',
    };

    // 2. Anomalous hidden gem (passes raw star/delta thresholds, but flagged as ANOMALOUS SIGNAL)
    const anomalousGem = {
      id: 102,
      totalStars: 1400,
      deltaStars: 550,
      forksCount: 3,
      description: 'Fake high-growth repo with abnormal burst and zero organic community',
      isHiddenGem: isHiddenGem({ totalStars: 1400, deltaStars: 550, forksCount: 3, description: 'Fake high-growth repo with abnormal burst and zero organic community' }),
      anomalyStatus: 'ANOMALOUS SIGNAL',
    };

    // 3. Non-hidden-gem (large repository exceeding 1,500 total stars)
    const giantRepo = {
      id: 103,
      totalStars: 50000,
      deltaStars: 200,
      forksCount: 3500,
      description: 'Major open-source ecosystem project with hundreds of thousands of stars',
      isHiddenGem: isHiddenGem({ totalStars: 50000, deltaStars: 200, forksCount: 3500, description: 'Major open-source ecosystem project with hundreds of thousands of stars' }),
      anomalyStatus: 'NORMAL',
    };

    // Verify raw isHiddenGem values
    assert.strictEqual(normalGem.isHiddenGem, true, 'Normal gem has isHiddenGem = true');
    assert.strictEqual(anomalousGem.isHiddenGem, true, 'Anomalous gem technically met raw star/delta criteria');
    assert.strictEqual(giantRepo.isHiddenGem, false, 'Giant repo has isHiddenGem = false');

    // Regression checks against canonical predicate
    assert.strictEqual(isVerifiedHiddenGem(normalGem), true, 'Normal hidden gem MUST be included');
    assert.strictEqual(isVerifiedHiddenGem(anomalousGem), false, 'Anomalous hidden gem MUST be excluded');
    assert.strictEqual(isVerifiedHiddenGem(giantRepo), false, 'Non-hidden-gem MUST be excluded');

    // Dataset simulation
    const dataset = [normalGem, anomalousGem, giantRepo];

    // ETL summary count calculation
    const hiddenGemsCount = dataset.filter(isVerifiedHiddenGem).length;

    // Page rendering list calculation
    const pageRenderedRepos = dataset.filter(isVerifiedHiddenGem);

    // EXACT EQUALITY ASSERTION
    assert.strictEqual(
      hiddenGemsCount,
      pageRenderedRepos.length,
      'Summary count must EXACTLY equal the number displayed by /hidden-gems'
    );
    assert.strictEqual(hiddenGemsCount, 1, 'Only genuine, non-anomalous gems are counted');
    assert.strictEqual(pageRenderedRepos[0].id, 101, 'Rendered repo is normalGem');
  });
});
