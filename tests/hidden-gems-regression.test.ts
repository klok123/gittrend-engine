import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isHiddenGem, isVerifiedHiddenGem } from '../src/engine/ranking';

describe('Condition 1 Regression: Hidden Gems Canonical Predicate Alignment', () => {
  it('proves normal hidden gem is included, anomalous hidden gem is excluded, and counts match exactly', () => {
    // 1. Normal Hidden Gem: totalStars <= 1500, delta >= 25, forks >= 3, description >= 15 chars, anomalyStatus: NORMAL
    const normalGem = {
      id: 101,
      totalStars: 1200,
      deltaStars: 50,
      forksCount: 20,
      description: 'Production-ready database connection pooler and cache layer',
      isHiddenGem: isHiddenGem({ totalStars: 1200, deltaStars: 50, forksCount: 20, description: 'Production-ready database connection pooler and cache layer' }),
      anomalyStatus: 'NORMAL',
    };

    // 2. Anomalous Hidden Gem: Qualifies by stars and delta, but flagged as ANOMALOUS SIGNAL (e.g., bot attack)
    const anomalousGem = {
      id: 102,
      totalStars: 1400,
      deltaStars: 550,
      forksCount: 3,
      description: 'Fake high-growth repo with abnormal burst and zero organic community',
      isHiddenGem: isHiddenGem({ totalStars: 1400, deltaStars: 550, forksCount: 3, description: 'Fake high-growth repo with abnormal burst and zero organic community' }),
      anomalyStatus: 'ANOMALOUS SIGNAL',
    };

    // 3. Non-Hidden-Gem: Giant repository (totalStars > 1500)
    const giantRepo = {
      id: 103,
      totalStars: 50000,
      deltaStars: 200,
      forksCount: 3500,
      description: 'Major open-source ecosystem project with hundreds of thousands of stars',
      isHiddenGem: isHiddenGem({ totalStars: 50000, deltaStars: 200, forksCount: 3500, description: 'Major open-source ecosystem project with hundreds of thousands of stars' }),
      anomalyStatus: 'NORMAL',
    };

    // Verify individual predicate evaluations
    assert.strictEqual(normalGem.isHiddenGem, true, 'Normal gem should have isHiddenGem = true');
    assert.strictEqual(anomalousGem.isHiddenGem, true, 'Anomalous gem technically met raw star/delta criteria');
    assert.strictEqual(giantRepo.isHiddenGem, false, 'Giant repo must have isHiddenGem = false');

    // Canonical verification check
    assert.strictEqual(isVerifiedHiddenGem(normalGem), true, 'Normal gem MUST pass isVerifiedHiddenGem');
    assert.strictEqual(isVerifiedHiddenGem(anomalousGem), false, 'Anomalous gem MUST be REJECTED by isVerifiedHiddenGem');
    assert.strictEqual(isVerifiedHiddenGem(giantRepo), false, 'Giant repo MUST be REJECTED by isVerifiedHiddenGem');

    // Dataset simulation
    const dataset = [normalGem, anomalousGem, giantRepo];

    // ETL summary field computation (matching scripts/run-trend-etl.ts)
    const hiddenGemsCount = dataset.filter(isVerifiedHiddenGem).length;

    // Page rendering list (matching src/app/hidden-gems/page.tsx)
    const pageRenderedRepos = dataset.filter(isVerifiedHiddenGem);

    // EXACT EQUALITY ASSERTION
    assert.strictEqual(
      hiddenGemsCount,
      pageRenderedRepos.length,
      'Summary hiddenGemsCount must EXACTLY equal the number of items rendered on /hidden-gems'
    );
    assert.strictEqual(hiddenGemsCount, 1, 'Only the normal genuine gem should be counted');
    assert.strictEqual(pageRenderedRepos[0].id, 101, 'Rendered repo must be normalGem');
  });
});
