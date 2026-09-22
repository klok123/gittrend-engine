import { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

export type TrustGrade = 'A+' | 'A' | 'B' | 'C' | 'F';

export interface OrganicTrustResult {
  score: number; // 0 - 100
  grade: TrustGrade;
  forkRatioPercent: number;
  anomalyStatus: 'NORMAL' | 'REVIEW' | 'ANOMALOUS SIGNAL';
  signals: string[];
  summary: string;
}

export type AccelerationStatus = 'ACCELERATING' | 'STEADY' | 'COOLING';

export interface GrowthAccelerationResult {
  dailyRate: number;
  weeklyAvgDailyRate: number;
  acceleration: number; // deltaToday - (deltaWeek / 7)
  status: AccelerationStatus;
  percentageChange: number; // relative acceleration rate
}

export type MaintenanceCadence = 'HYPER-ACTIVE' | 'ACTIVE' | 'STABLE' | 'DORMANT';

export interface MaintenanceVitalityResult {
  daysSinceLastPush: number;
  cadence: MaintenanceCadence;
  issueRatioPercent: number;
  maturityStage: 'EMERGING' | 'GROWING' | 'MATURE' | 'LEGACY';
  ageDays: number;
  signals: string[];
}

/**
 * Calculates Organic Trust Score (0-100) & Grade.
 * Evaluates fork dispersion, anomaly detection status, and star-to-fork balance.
 */
export function calculateOrganicTrustScore(repo: NormalizedTrendingRepo): OrganicTrustResult {
  const safeStars = Math.max(1, repo.totalStars);
  const forkRatio = repo.forksCount / safeStars;
  const forkRatioPercent = Number((forkRatio * 100).toFixed(2));

  let score = 70; // Baseline starting score
  const signals: string[] = [];

  // 1. Fork Dispersion Factor
  if (forkRatio >= 0.08) {
    score += 15;
    signals.push('High Fork Dispersion (Strong Community Usage)');
  } else if (forkRatio >= 0.03) {
    score += 8;
    signals.push('Healthy Fork Dispersion');
  } else if (forkRatio >= 0.01) {
    score -= 10;
    signals.push('Moderate Fork Dispersion');
  } else if (safeStars > 200) {
    // Under 1% forks for repos with >200 stars is a frequent indicator of synthetic star farming
    score -= 30;
    signals.push('Low Fork-to-Star Ratio (Suspicious Organic Dispersion)');
  }

  // 2. Anomaly Status Factor
  if (repo.anomalyStatus === 'NORMAL') {
    score += 15;
    signals.push('Passed Anti-Spike Anomaly Gate');
  } else if (repo.anomalyStatus === 'REVIEW') {
    score -= 15;
    signals.push('Recent Velocity Under Review');
  } else if (repo.anomalyStatus === 'ANOMALOUS SIGNAL') {
    score -= 45;
    signals.push(`Flagged for Anomalous Growth: ${repo.anomalyFlags.join(', ') || 'Abnormal Spike'}`);
  }

  // 3. Issue Engagement Factor
  if (repo.openIssuesCount > 0) {
    score += 5;
    signals.push('Active Issue Engagement');
  }

  // 4. Age & Maturity Baseline
  const now = Date.now();
  const createdTime = new Date(repo.createdAt).getTime();
  const ageDays = Math.max(0, Math.floor((now - createdTime) / (1000 * 60 * 60 * 24)));
  if (ageDays > 90) {
    score += 5;
    signals.push('Established Repository Age (>90 days)');
  } else if (ageDays < 7 && repo.totalStars > 500) {
    score -= 10;
    signals.push('Brand New Repository with Extreme Influx (<7 days)');
  }

  // Hard Invariant Clamping: Bounded between 5 and 100
  const finalScore = Math.min(100, Math.max(5, score));

  // Determine Trust Grade
  let grade: TrustGrade;
  if (repo.anomalyStatus === 'ANOMALOUS SIGNAL') {
    // Invariant: Anomalous signal repos can NEVER receive A or A+
    grade = finalScore >= 60 ? 'C' : 'F';
  } else if (finalScore >= 90) {
    grade = 'A+';
  } else if (finalScore >= 80) {
    grade = 'A';
  } else if (finalScore >= 65) {
    grade = 'B';
  } else if (finalScore >= 50) {
    grade = 'C';
  } else {
    grade = 'F';
  }

  let summary = 'Organic community adoption with verified developer engagement.';
  if (grade === 'A+' || grade === 'A') {
    summary = 'High-confidence organic project with stellar fork dispersion and verified commit cadence.';
  } else if (grade === 'B') {
    summary = 'Solid open-source repository with healthy trajectory and typical growth patterns.';
  } else if (grade === 'C') {
    summary = 'Moderate confidence; growth metrics exhibit slight dispersion imbalances or are under review.';
  } else {
    summary = 'Low organic confidence; extreme growth velocity with insufficient fork dispersion or anomaly flags.';
  }

  return {
    score: finalScore,
    grade,
    forkRatioPercent,
    anomalyStatus: repo.anomalyStatus,
    signals,
    summary,
  };
}

/**
 * Calculates Growth Acceleration vs 7-day trailing velocity.
 */
export function calculateGrowthAcceleration(repo: NormalizedTrendingRepo): GrowthAccelerationResult {
  const dailyRate = repo.starsGainedToday;
  const weeklyAvgDailyRate = Number((repo.starsGainedWeek / 7).toFixed(2));
  const acceleration = Number((dailyRate - weeklyAvgDailyRate).toFixed(2));

  let status: AccelerationStatus = 'STEADY';
  if (acceleration > 5) {
    status = 'ACCELERATING';
  } else if (acceleration < -5) {
    status = 'COOLING';
  }

  let percentageChange = 0;
  if (weeklyAvgDailyRate > 0) {
    percentageChange = Number(((acceleration / weeklyAvgDailyRate) * 100).toFixed(1));
  } else if (dailyRate > 0) {
    percentageChange = 100;
  }

  return {
    dailyRate,
    weeklyAvgDailyRate,
    acceleration,
    status,
    percentageChange,
  };
}

/**
 * Calculates Maintenance Vitality and Repository Maturity Cadence.
 */
export function calculateMaintenanceVitality(repo: NormalizedTrendingRepo): MaintenanceVitalityResult {
  const now = Date.now();
  const pushTime = new Date(repo.pushedAt).getTime();
  const createdTime = new Date(repo.createdAt).getTime();

  const daysSinceLastPush = Math.max(0, Math.floor((now - pushTime) / (1000 * 60 * 60 * 24)));
  const ageDays = Math.max(0, Math.floor((now - createdTime) / (1000 * 60 * 60 * 24)));

  let cadence: MaintenanceCadence = 'DORMANT';
  const signals: string[] = [];

  if (daysSinceLastPush <= 7) {
    cadence = 'HYPER-ACTIVE';
    signals.push('Pushed within the last 7 days');
  } else if (daysSinceLastPush <= 30) {
    cadence = 'ACTIVE';
    signals.push('Pushed within the last 30 days');
  } else if (daysSinceLastPush <= 180) {
    cadence = 'STABLE';
    signals.push('Stable releases within last 6 months');
  } else {
    cadence = 'DORMANT';
    signals.push('No push activity in >180 days');
  }

  let maturityStage: 'EMERGING' | 'GROWING' | 'MATURE' | 'LEGACY' = 'EMERGING';
  if (ageDays < 90) {
    maturityStage = 'EMERGING';
  } else if (ageDays < 365) {
    maturityStage = 'GROWING';
  } else if (ageDays < 1095) {
    maturityStage = 'MATURE';
  } else {
    maturityStage = 'LEGACY';
  }

  const safeStars = Math.max(1, repo.totalStars);
  const issueRatioPercent = Number(((repo.openIssuesCount / safeStars) * 100).toFixed(2));

  return {
    daysSinceLastPush,
    cadence,
    issueRatioPercent,
    maturityStage,
    ageDays,
    signals,
  };
}
