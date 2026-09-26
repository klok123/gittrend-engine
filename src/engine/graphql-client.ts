import { RateLimitGovernor, RateLimitState } from './rate-governor';

export interface RawRepoNode {
  databaseId: number;
  nameWithOwner: string;
  name: string;
  owner: {
    login: string;
    avatarUrl: string;
    createdAt?: string;
  };
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  openIssues?: {
    totalCount: number;
  };
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  createdAt: string;
  pushedAt: string;
  isArchived: boolean;
  isFork: boolean;
  baselineMetrics?: {
    starsGainedToday: number;
    starsGainedWeek: number;
    starsGainedMonth: number;
    sparkline: number[];
  };
}

export interface GraphQLBatchResponse {
  rateLimit?: RateLimitState;
  search: {
    repositoryCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: RawRepoNode[];
  };
}

const REPO_FIELDS = `
        databaseId
        nameWithOwner
        name
        owner {
          login
          avatarUrl
          ... on User {
            createdAt
          }
          ... on Organization {
            createdAt
          }
        }
        description
        url
        stargazerCount
        forkCount
        openIssues: issues(states: OPEN) {
          totalCount
        }
        primaryLanguage {
          name
          color
        }
        repositoryTopics(first: 6) {
          nodes {
            topic {
              name
            }
          }
        }
        createdAt
        pushedAt
        isArchived
        isFork
`;

const GQL_QUERY = `
query IngestTrendingBatch($searchQuery: String!, $cursor: String, $batchSize: Int!) {
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
  search(query: $searchQuery, type: REPOSITORY, first: $batchSize, after: $cursor) {
    repositoryCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ... on Repository {${REPO_FIELDS}
      }
    }
  }
}
`;

const GQL_SINGLE_REPO_QUERY = `
query FetchSingleRepo($owner: String!, $name: String!) {
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
  repository(owner: $owner, name: $name) {${REPO_FIELDS}
  }
}
`;

export class GitHubGraphQLClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || '';
  }

  public hasToken(): boolean {
    return Boolean(this.token && this.token.trim().length > 0);
  }

  public async fetchBatch(
    searchQuery: string,
    cursor: string | null = null,
    batchSize: number = 50
  ): Promise<{ data: GraphQLBatchResponse; rateLimit?: RateLimitState }> {
    if (!this.hasToken()) {
      throw new Error('[GITHUB_CLIENT] GITHUB_TOKEN is required to execute GraphQL queries.');
    }

    return RateLimitGovernor.executeWithGovernor(async () => {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GitHubTrendEngine/1.0',
        },
        body: JSON.stringify({
          query: GQL_QUERY,
          variables: {
            searchQuery,
            cursor,
            batchSize: Math.min(batchSize, 50),
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const err: any = new Error(`GitHub API HTTP ${res.status}: ${errorText}`);
        err.status = res.status;
        err.response = res;
        throw err;
      }

      const json = await res.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(`[GRAPHQL_ERROR] ${json.errors.map((e: any) => e.message).join(', ')}`);
      }

      const payload: GraphQLBatchResponse = json.data;
      return {
        data: payload,
        rateLimit: payload.rateLimit,
        headers: res.headers,
      };
    });
  }

  /**
   * Fetch a single repository by owner/name (used for community submissions).
   * Returns null when the repository does not exist or is not visible.
   */
  public async fetchSingleRepo(
    owner: string,
    name: string
  ): Promise<{ repo: RawRepoNode | null; rateLimit?: RateLimitState }> {
    if (!this.hasToken()) {
      throw new Error('[GITHUB_CLIENT] GITHUB_TOKEN is required to execute GraphQL queries.');
    }

    // Single-repo lookups are rare (one per submission issue), so they bypass
    // the batch rate-limit governor and use a direct fetch instead.
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHubTrendEngine/1.0',
      },
      body: JSON.stringify({
        query: GQL_SINGLE_REPO_QUERY,
        variables: { owner, name },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const err: any = new Error(`GitHub API HTTP ${res.status}: ${errorText}`);
      err.status = res.status;
      err.response = res;
      throw err;
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      // NOT_FOUND for a deleted/renamed repo is not fatal — treat as missing
      const notFound = json.errors.some((e: any) => e.type === 'NOT_FOUND');
      if (notFound) return { repo: null, rateLimit: json.data?.rateLimit };
      throw new Error(`[GRAPHQL_ERROR] ${json.errors.map((e: any) => e.message).join(', ')}`);
    }

    return { repo: (json.data?.repository as RawRepoNode) || null, rateLimit: json.data?.rateLimit };
  }

  /**
   * Official Post-September 2026 Privacy-Safe Historical Star Aggregations
   * GET /repos/{owner}/{repo}/stargazers/history
   */
  public async fetchHistoricalStars(owner: string, repo: string): Promise<any> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10',
      'User-Agent': 'GitHubTrendEngine/1.0',
    };
    if (this.hasToken()) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/stargazers/history`, {
      headers,
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  }
}
