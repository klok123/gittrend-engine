/**
 * Community submission intake for the /submit page.
 *
 * Flow: maintainer submits via the website -> a pre-filled GitHub issue with
 * label `submission` is created -> this module (run inside the 6-hourly ETL)
 * reads open submission issues, verifies each repository via the GitHub
 * GraphQL API, and hands verified nodes back to the normalizer. Issues are
 * resolved (commented + closed) after the anomaly gate decides their fate.
 */
import type { GitHubGraphQLClient, RawRepoNode } from '../../src/engine/graphql-client';

const REPO = 'klok123/gittrend-engine';
const SUBMISSION_MARKER = 'repopicks-submission';

export interface SubmissionCandidate {
  node: RawRepoNode;
  issueNumber: number;
  submitter: string;
}

function parseRepoRef(body: string): string | null {
  if (!body.includes(SUBMISSION_MARKER)) return null;
  const m = body.match(/^Repository:\s*([^\s/]+\/[^\s/]+)/im);
  return m ? m[1].trim() : null;
}

function parseSubmitter(body: string): string {
  const m = body.match(/^Submitter:\s*([^\n]+)/im);
  const v = m ? m[1].trim() : '';
  return v && v !== '(anonymous)' ? v : 'a community member';
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'GitHubTrendEngine/1.0',
  };
}

/**
 * Fetch open `submission` issues and verify each referenced repository.
 * Never throws — a broken intake must not fail the whole ETL run.
 */
export async function fetchCommunitySubmissions(
  client: GitHubGraphQLClient
): Promise<SubmissionCandidate[]> {
  const token = process.env.GITHUB_TOKEN || '';
  if (!token) {
    console.warn('[SUBMISSIONS] No GITHUB_TOKEN — skipping community intake.');
    return [];
  }

  const out: SubmissionCandidate[] = [];
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues?labels=submission&state=open&per_page=20`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) {
      console.warn(`[SUBMISSIONS] Issues API returned ${res.status} — skipping.`);
      return [];
    }
    const issues: any[] = await res.json();

    for (const issue of issues) {
      if (issue.pull_request) continue; // issues only
      const ref = parseRepoRef(issue.body || '');
      if (!ref) {
        console.warn(`[SUBMISSIONS] Issue #${issue.number} has no parseable repository — leaving open.`);
        continue;
      }
      const [owner, name] = ref.split('/');
      try {
        const { repo } = await client.fetchSingleRepo(owner, name);
        if (!repo) {
          console.warn(`[SUBMISSIONS] ${ref} not found or not visible — leaving issue #${issue.number} open.`);
          continue;
        }
        if (repo.isFork) {
          console.warn(`[SUBMISSIONS] ${ref} is a fork — excluded by policy.`);
          await commentOnIssue(token, issue.number,
            `Thanks for submitting **${ref}**! Our policy only spotlights original repositories, so forks are excluded.`);
          continue;
        }
        if (repo.isArchived) {
          console.warn(`[SUBMISSIONS] ${ref} is archived — excluded.`);
          await commentOnIssue(token, issue.number,
            `Thanks for submitting **${ref}**! Archived repositories can't be featured, so this one is excluded.`);
          continue;
        }
        (repo as any).isCommunitySubmission = true;
        out.push({ node: repo, issueNumber: issue.number, submitter: parseSubmitter(issue.body || '') });
        console.log(`[SUBMISSIONS] Verified ${ref} from issue #${issue.number}.`);
      } catch (e: any) {
        console.warn(`[SUBMISSIONS] Failed to verify ${ref}: ${e.message}`);
      }
    }
  } catch (e: any) {
    console.warn(`[SUBMISSIONS] Intake failed (non-fatal): ${e.message}`);
  }
  return out;
}

async function commentOnIssue(token: string, issueNumber: number, body: string): Promise<void> {
  await fetch(`https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: ghHeaders(token),
    body: JSON.stringify({ body }),
  });
}

/**
 * Resolve a submission issue after the anomaly gate has run.
 * Featured repos get a thank-you + close; held-back repos get an honest note
 * and stay open (no silent drops).
 */
export async function resolveSubmissionIssue(
  issueNumber: number,
  featured: boolean,
  repoFullName: string
): Promise<void> {
  const token = process.env.GITHUB_TOKEN || '';
  if (!token) return;
  try {
    if (featured) {
      await commentOnIssue(
        token,
        issueNumber,
        `🎉 **${repoFullName}** passed our automatic quality checks and is now live in the Community Picks shelf on [RepoPicks](https://clever-volta-lac.vercel.app/)! Thanks for submitting.`
      );
      await fetch(`https://api.github.com/repos/${REPO}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: ghHeaders(token),
        body: JSON.stringify({ state: 'closed' }),
      });
      console.log(`[SUBMISSIONS] Issue #${issueNumber} featured + closed.`);
    } else {
      await commentOnIssue(
        token,
        issueNumber,
        `Thanks for submitting **${repoFullName}**. Our automatic anomaly check flagged unusual growth patterns on this repository, so it is held back from the spotlight for now — this is a statistical signal, not a judgment. It will be re-checked automatically on future runs.`
      );
      console.log(`[SUBMISSIONS] Issue #${issueNumber} held back (anomaly), left open.`);
    }
  } catch (e: any) {
    console.warn(`[SUBMISSIONS] Failed to resolve issue #${issueNumber}: ${e.message}`);
  }
}
