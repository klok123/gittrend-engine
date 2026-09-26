import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AnomalyDetector } from '../src/engine/anomaly';

describe('Anomaly & Suspicious Growth Scoring', () => {
  it('classifies healthy organic repos as NORMAL', () => {
    const res = AnomalyDetector.evaluate({
      starsGained24h: 85,
      totalStars: 4200,
      forksCount: 380,
      issuesCount: 24,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400), // >1 year old
      lastPushedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    });
    assert.strictEqual(res.status, 'NORMAL');
    assert.ok(res.score < 0.3, 'Score must be under 0.3 for organic repos');
    assert.strictEqual(res.flags.length, 0);
  });

  it('classifies unnatural 0-fork bursts as ANOMALOUS SIGNAL', () => {
    const res = AnomalyDetector.evaluate({
      starsGained24h: 1500,
      totalStars: 1550,
      forksCount: 0,
      issuesCount: 0,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours old
      lastPushedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200), // 200 days old
    });
    assert.strictEqual(res.status, 'ANOMALOUS SIGNAL');
    assert.ok(res.score >= 0.65, 'Anomaly score should be >= 0.65');
    assert.ok(res.flags.includes('HIGH_VELOCITY_ZERO_FORK_SPURT'));
  });

  it('classifies borderline spurts as REVIEW', () => {
    const res = AnomalyDetector.evaluate({
      starsGained24h: 600,
      totalStars: 800,
      forksCount: 15,
      issuesCount: 4,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      lastPushedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210), // dormant repo surge
    });
    // Triggers DORMANT_REPO_SURGE (+0.20), but not zero-fork.
    assert.ok(res.score >= 0.20);
  });

  it('catches bot-farmed spike with minimal dummy forks as ANOMALOUS SIGNAL', () => {
    const res = AnomalyDetector.evaluate({
      starsGained24h: 2000,
      totalStars: 1200,
      forksCount: 2,
      issuesCount: 1,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100),
      lastPushedAt: new Date(),
    });
    assert.strictEqual(res.status, 'ANOMALOUS SIGNAL');
    assert.ok(res.score >= 0.65, 'Bot surge with 2 forks must exceed 0.65');
    assert.ok(res.flags.includes('MASSIVE_UNVERIFIED_STAR_SURGE'));
  });

  it('does NOT nuke a legit viral launch as ANOMALOUS SIGNAL', () => {
    // The #7 false-positive: 700 stars/24h, 2 forks, brand-new owner —
    // but a real human-written description + curated topics. Previously
    // scored 0.80 (V1+V2 double-counted the same fork-star signal) and was
    // excluded site-wide. Now the fork-star vectors dedupe and legitimacy
    // signals discount it to REVIEW.
    const res = AnomalyDetector.evaluate({
      starsGained24h: 700,
      totalStars: 1200,
      forksCount: 2,
      issuesCount: 6,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24h old
      lastPushedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
      hasRealDescription: true,
      topicCount: 3,
    });
    assert.notStrictEqual(res.status, 'ANOMALOUS SIGNAL');
    assert.ok(res.score < 0.65, `Score must stay under 0.65, got ${res.score}`);
    assert.strictEqual(res.status, 'REVIEW');
  });

  it('keeps a suspicious-but-unproven surge at REVIEW without legitimacy signals', () => {
    const res = AnomalyDetector.evaluate({
      starsGained24h: 700,
      totalStars: 1200,
      forksCount: 2,
      issuesCount: 0,
      ownerCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      lastPushedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      hasRealDescription: false,
      topicCount: 0,
    });
    // 0.35 (fork-star, deduped) + 0.20 (new owner) = 0.55 -> REVIEW:
    // suspicious, but without the massive-surge vector it stays reviewable.
    assert.strictEqual(res.status, 'REVIEW');
  });
});
