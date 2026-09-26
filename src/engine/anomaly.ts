export interface AnomalyInput {
  starsGained24h: number;
  totalStars: number;
  forksCount: number;
  issuesCount: number;
  ownerCreatedAt?: Date | string;
  lastPushedAt?: Date | string;
  /**
   * Legitimacy signals (optional). Botted/farmed repos rarely have a real
   * human-written description or curated topics — when both are present the
   * repo is much more likely a genuine viral launch, so the score is
   * discounted instead of stacking every weak signal against it.
   */
  hasRealDescription?: boolean;
  topicCount?: number;
}

export interface AnomalyEvaluation {
  score: number;
  status: 'NORMAL' | 'REVIEW' | 'ANOMALOUS SIGNAL';
  flags: string[];
}

export class AnomalyDetector {
  public static evaluate(input: AnomalyInput): AnomalyEvaluation {
    let score = 0.0;
    const flags: string[] = [];

    // Vectors 1+2 (deduped): "a lot of stars, almost no forks" is ONE
    // underlying signal observed at two different windows (24h vs lifetime).
    // Summing both triple-counted a single observation and nuked legit viral
    // launches — take the max instead. Flags are still recorded for
    // transparency; only the score is deduped.
    let forkStarSignal = 0;
    if (input.starsGained24h > 500 && input.forksCount <= 3) {
      forkStarSignal = Math.max(forkStarSignal, 0.35);
      flags.push('HIGH_VELOCITY_ZERO_FORK_SPURT');
    }
    if (input.totalStars > 1000 && input.forksCount <= 2) {
      forkStarSignal = Math.max(forkStarSignal, 0.25);
      flags.push('FORK_STAR_DISPARITY');
    }
    score += forkStarSignal;

    // Vector 3: Owner Account Age (< 48 hours old)
    if (input.ownerCreatedAt) {
      const ownerDate = new Date(input.ownerCreatedAt).getTime();
      const hoursSinceOwnerCreated = (Date.now() - ownerDate) / (1000 * 60 * 60);
      if (hoursSinceOwnerCreated > 0 && hoursSinceOwnerCreated < 48) {
        score += 0.20;
        flags.push('NEW_OWNER_ACCOUNT');
      }
    }

    // Vector 4: Commit Stagnation (> 180 days dormant with large 24h surge)
    if (input.lastPushedAt) {
      const pushDate = new Date(input.lastPushedAt).getTime();
      const daysSinceLastPush = (Date.now() - pushDate) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPush > 180 && input.starsGained24h > 500) {
        score += 0.20;
        flags.push('DORMANT_REPO_SURGE');
      }
    }

    // Vector 5: Massive Unverified Surge (>= 1500 stars in 24h with <=5 forks).
    // This is the hardest single signal of artificial inflation, so it stands
    // apart from the moderate fork-star vectors above.
    if (input.starsGained24h >= 1500 && input.forksCount <= 5) {
      score += 0.35;
      flags.push('MASSIVE_UNVERIFIED_STAR_SURGE');
    }

    // Legitimacy discount: a real description + curated topics means a human
    // maintains this repo. Applied AFTER all vectors so genuine viral launches
    // (which trip the velocity vectors) aren't excluded site-wide.
    if (input.hasRealDescription && (input.topicCount ?? 0) >= 1) {
      score = Math.max(0, score - 0.15);
    }

    score = Math.min(1.0, Math.round(score * 100) / 100);

    let status: 'NORMAL' | 'REVIEW' | 'ANOMALOUS SIGNAL' = 'NORMAL';
    if (score >= 0.65) {
      status = 'ANOMALOUS SIGNAL';
    } else if (score >= 0.30) {
      status = 'REVIEW';
    }

    return { score, status, flags };
  }
}
