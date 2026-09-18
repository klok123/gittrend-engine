export interface RankingInput {
  repositoryId: number;
  totalStars: number;
  deltaStars: number;
  forksCount: number;
  hoursElapsed: number;
}

export interface RankingResult {
  score: number;
  modelName: string;
}

export interface RankingStrategy {
  name: string;
  calculate(input: RankingInput): RankingResult;
}

/**
 * Candidate Model 1: Velocity-over-Log-Stars (Competitor-Derived Hypothesis)
 * Formula: (Delta Stars)^2 / ln(Total Stars + 10)
 */
export class VelocityLogStrategy implements RankingStrategy {
  public name = 'momentum_log';

  calculate(input: RankingInput): RankingResult {
    const delta = Math.max(input.deltaStars, 0);
    const total = Math.max(input.totalStars, 0);
    const denominator = Math.log(total + 10);
    const score = Math.pow(delta, 2) / denominator;
    return { score: Number(score.toFixed(4)), modelName: this.name };
  }
}

/**
 * Candidate Model 2: Hacker News Gravity Decay Model
 * Formula: (Delta Stars - 1) / (Hours Elapsed + 2)^1.8
 */
export class GravityDecayStrategy implements RankingStrategy {
  public name = 'hn_gravity';
  private gravity = 1.8;

  calculate(input: RankingInput): RankingResult {
    const numerator = Math.max(input.deltaStars - 1, 0);
    const denominator = Math.pow(Math.max(input.hoursElapsed, 0) + 2, this.gravity);
    const score = numerator / denominator;
    return { score: Number(score.toFixed(4)), modelName: this.name };
  }
}

/**
 * Candidate Model 3: Breakout Acceleration Ratio ("Rising Stars")
 * Formula: (Delta Stars 24h / max(Total - Delta, 10)) * 100
 */
export class BreakoutStrategy implements RankingStrategy {
  public name = 'breakout_ratio';

  calculate(input: RankingInput): RankingResult {
    const delta = Math.max(input.deltaStars, 0);
    const base = Math.max(input.totalStars - delta, 10);
    const ratio = (delta / base) * 100;
    return { score: Number(ratio.toFixed(2)), modelName: this.name };
  }
}

/**
 * Candidate Model 4: Bayesian Smoothed Velocity
 * Pulls noisy low-sample deltas toward population mean
 */
export class BayesianStrategy implements RankingStrategy {
  public name = 'bayesian_smoothed';
  private confidenceWeight = 100;
  private priorMeanRatio = 0.02; // Expected baseline daily growth ratio

  calculate(input: RankingInput): RankingResult {
    const delta = Math.max(input.deltaStars, 0);
    const total = Math.max(input.totalStars, 0);
    const numerator = (this.confidenceWeight * this.priorMeanRatio) + delta;
    const denominator = this.confidenceWeight + total;
    const score = (numerator / denominator) * 1000;
    return { score: Number(score.toFixed(4)), modelName: this.name };
  }
}

/**
 * Evaluates whether a repository qualifies as a "Hidden Gem"
 * Condition: High daily delta relative to small total stars (< 1500), at least 3 forks, and non-empty description
 */
export function isHiddenGem(repo: { totalStars: number; deltaStars: number; forksCount: number; description?: string }): boolean {
  return (
    repo.totalStars <= 1500 &&
    repo.deltaStars >= 25 &&
    repo.forksCount >= 3 &&
    Boolean(repo.description && repo.description.trim().length >= 15)
  );
}

/**
 * Canonical single-source-of-truth predicate for displayable Hidden Gems.
 * Enforces structural gem qualification AND strictly excludes anomalous signals.
 */
export function isVerifiedHiddenGem(repo: { isHiddenGem: boolean; anomalyStatus: string }): boolean {
  return repo.isHiddenGem && repo.anomalyStatus !== 'ANOMALOUS SIGNAL';
}

/**
 * Canonical single-source-of-truth predicate for displayable Rising repositories.
 * Enforces breakout qualification AND strictly excludes anomalous signals.
 */
export function isVerifiedRising(repo: { isRising: boolean; anomalyStatus: string }): boolean {
  return repo.isRising && repo.anomalyStatus !== 'ANOMALOUS SIGNAL';
}

/**
 * Computes Spearman Rank Correlation between two sets of rankings
 * Returns a value between -1.0 and +1.0
 */
export function computeSpearmanRankCorrelation(ranksA: number[], ranksB: number[]): number {
  const n = ranksA.length;
  if (n <= 1) return 1.0;
  let dSquaredSum = 0;
  for (let i = 0; i < n; i++) {
    const d = ranksA[i] - ranksB[i];
    dSquaredSum += d * d;
  }
  return 1 - (6 * dSquaredSum) / (n * (n * n - 1));
}
