import type { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

/**
 * Similar-repo / open-source-alternative heuristic.
 *
 * Everything below is computed from fields already present in
 * trending-summary.json — no extra API calls, no manual curation.
 *
 * SCORING (documented, deterministic):
 *   score = 4 × min(sharedTopics, 5)
 *         + 3  if same primary language
 *         − 2 × min(|log10(starsA) − log10(starsB)|, 3)
 *
 * Rationale:
 *  - Shared GitHub topics are the strongest "does the same thing" signal
 *    maintainers themselves provide (capped at 5 so topic-spam can't dominate).
 *  - Same language matters for "can I actually use/extend this" — worth a bonus.
 *  - Star-magnitude proximity keeps suggestions in the same weight class:
 *    a 40-star CLI and a 40k-star platform rarely substitute for each other.
 *    The log scale means "within ~10x" scores near full marks.
 *
 * SECTIONS:
 *  - "Similar repos": same language AND ≥1 shared topic (closest substitutes).
 *  - "Open-source alternatives": ≥2 shared topics, any language, different
 *    owner/name — the classic "alternative to X" discovery pattern.
 *
 * HONESTY: these are algorithmic suggestions based on shared topics &
 * language — not endorsements, and never influenced by sponsorship.
 * The UI must label them as such.
 */

export interface SimilarRepo {
  repo: NormalizedTrendingRepo;
  score: number;
  sharedTopics: string[];
}

function sharedTopics(a: NormalizedTrendingRepo, b: NormalizedTrendingRepo): string[] {
  const aTopics = new Set((a.topics || []).map((t) => t.toLowerCase()));
  return (b.topics || []).filter((t) => aTopics.has(t.toLowerCase()));
}

function starMagnitudeDistance(a: number, b: number): number {
  const la = Math.log10(Math.max(1, a));
  const lb = Math.log10(Math.max(1, b));
  return Math.min(Math.abs(la - lb), 3);
}

export function similarityScore(
  target: NormalizedTrendingRepo,
  candidate: NormalizedTrendingRepo
): { score: number; sharedTopics: string[] } {
  const shared = sharedTopics(target, candidate);
  const topicPoints = 4 * Math.min(shared.length, 5);
  const languageBonus =
    target.language &&
    candidate.language &&
    target.language.toLowerCase() === candidate.language.toLowerCase()
      ? 3
      : 0;
  const magnitudePenalty = 2 * starMagnitudeDistance(target.totalStars, candidate.totalStars);
  return { score: topicPoints + languageBonus - magnitudePenalty, sharedTopics: shared };
}

function rankCandidates(
  target: NormalizedTrendingRepo,
  all: NormalizedTrendingRepo[],
  predicate: (target: NormalizedTrendingRepo, c: NormalizedTrendingRepo, shared: string[]) => boolean,
  limit: number
): SimilarRepo[] {
  return all
    .filter((c) => c.id !== target.id && c.fullName.toLowerCase() !== target.fullName.toLowerCase())
    .map((c) => {
      const { score, sharedTopics: shared } = similarityScore(target, c);
      return { repo: c, score, sharedTopics: shared };
    })
    .filter((s) => predicate(target, s.repo, s.sharedTopics) && s.score > 0)
    .sort((a, b) => b.score - a.score || b.repo.velocityScore - a.repo.velocityScore)
    .slice(0, limit);
}

/** Closest substitutes: same language + at least one shared topic. */
export function findSimilarRepos(
  target: NormalizedTrendingRepo,
  all: NormalizedTrendingRepo[],
  limit = 6
): SimilarRepo[] {
  return rankCandidates(
    target,
    all,
    (t, c, shared) =>
      shared.length >= 1 &&
      !!t.language &&
      !!c.language &&
      t.language.toLowerCase() === c.language.toLowerCase(),
    limit
  );
}

/** "Alternative to X" discovery: ≥2 shared topics, any language. */
export function findAlternatives(
  target: NormalizedTrendingRepo,
  all: NormalizedTrendingRepo[],
  limit = 6
): SimilarRepo[] {
  return rankCandidates(target, all, (_t, _c, shared) => shared.length >= 2, limit);
}

/**
 * Fallback for repos with no usable topic data (~15% of the dataset).
 * Same language + star-magnitude proximity only — deliberately weaker signal,
 * so the UI labels it "More in {language}" instead of "Similar repos".
 */
export function findLanguagePeers(
  target: NormalizedTrendingRepo,
  all: NormalizedTrendingRepo[],
  limit = 6
): SimilarRepo[] {
  if (!target.language) return [];
  return rankCandidates(
    target,
    all,
    (t, c) =>
      !!c.language && t.language.toLowerCase() === c.language.toLowerCase(),
    limit
  );
}
