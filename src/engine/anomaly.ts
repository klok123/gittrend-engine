export interface AnomalyInput {
  starsGained24h: number;
  totalStars: number;
  forksCount: number;
  issuesCount: number;
  ownerCreatedAt?: Date | string;
  lastPushedAt?: Date | string;
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

    // Vector 1: Velocity Spurt Factor (>500 in 24h with <=3 forks)
    if (input.starsGained24h > 500 && input.forksCount <= 3) {
      score += 0.35;
      flags.push('HIGH_VELOCITY_ZERO_FORK_SPURT');
    }

    // Vector 2: Fork/Star Disparity (>1,000 total stars but <=2 forks)
    if (input.totalStars > 1000 && input.forksCount <= 2) {
      score += 0.25;
      flags.push('FORK_STAR_DISPARITY');
    }

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

    // Vector 5: Massive Unverified Surge (>= 1500 stars in 24h with <=5 forks)
    if (input.starsGained24h >= 1500 && input.forksCount <= 5) {
      score += 0.25;
      flags.push('MASSIVE_UNVERIFIED_STAR_SURGE');
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
