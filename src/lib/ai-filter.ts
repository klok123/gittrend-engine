/**
 * ai-filter.ts — heuristic "is this repo AI/ML-related?" filter.
 *
 * Powers the "Hide AI/ML" exclusion chip on the trending feed and the
 * /trending/without-ai page. This is a documented heuristic, not a
 * classifier: it matches GitHub topics plus a small set of name/description
 * keywords. False positives/negatives are possible; the topic list below is
 * the source of truth and can be extended without touching UI code.
 *
 * ZERO manual input — runs fully automatically on ETL data.
 */

/** GitHub topics that mark a repository as AI/ML-related. */
export const AI_TOPICS: string[] = [
  // Core AI/ML
  'ai',
  'artificial-intelligence',
  'machine-learning',
  'machinelearning',
  'ml',
  'deep-learning',
  'deeplearning',
  'neural-network',
  'neural-networks',
  // LLMs & generative AI
  'llm',
  'llms',
  'large-language-models',
  'generative-ai',
  'genai',
  'gpt',
  'chatgpt',
  'openai',
  'anthropic',
  'transformer',
  'transformers',
  'diffusion',
  'stable-diffusion',
  'text-generation',
  'prompt-engineering',
  // AI application areas
  'computer-vision',
  'nlp',
  'natural-language-processing',
  'speech-recognition',
  'speech-to-text',
  'text-to-speech',
  'recommendation-system',
  'reinforcement-learning',
  // AI infra / tooling
  'llmops',
  'rag',
  'retrieval-augmented-generation',
  'vector-database',
  'embeddings',
  'inference',
  'ai-agents',
  'autonomous-agents',
  'local-ai',
  'mcp',
];

/** Lowercase keyword fragments matched against "owner/name" + description. */
const AI_NAME_KEYWORDS: string[] = [
  'gpt-',
  'gpt4',
  'gpt-4',
  'chatgpt',
  'llm',
  'diffusion',
  'stable-diffusion',
  'midjourney',
  'copilot',
];

export interface AiFilterableRepo {
  topics?: string[] | null;
  fullName?: string;
  owner?: string;
  name?: string;
  description?: string | null;
}

/** Returns true when the repo looks AI/ML-related per the heuristic above. */
export function isAiRepo(repo: AiFilterableRepo): boolean {
  const topics = (repo.topics || []).map((t) => t.toLowerCase().trim());
  if (topics.some((t) => AI_TOPICS.includes(t))) return true;

  const haystack = `${repo.fullName || `${repo.owner || ''}/${repo.name || ''}`} ${
    repo.description || ''
  }`.toLowerCase();
  return AI_NAME_KEYWORDS.some((kw) => haystack.includes(kw));
}
