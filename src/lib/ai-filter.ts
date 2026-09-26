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
  // Agentic era (2025-26): coding agents, skills, harnesses
  'agent-skills',
  'ai-agent',
  'agentic',
  'agentic-ai',
  'agentic-workflows',
  'ai-coding',
  'vibe-coding',
  'coding-agents',
  'code-agents',
  'claude',
  'claude-code',
  'claude-skills',
  'multi-agent',
  'multiagent',
  'llm-agents',
  'agent-framework',
  'mcp-server',
  'mcp-servers',
  'model-context-protocol',
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
  // Agentic era: multi-word fragments keep false positives low
  // (bare "agent" would match ssh-agent, user-agent, travel agents, ...).
  'ai agent',
  'ai-agent',
  'ai agents',
  'coding agent',
  'coding-agent',
  'code agent',
  'agentic',
  'autonomous agent',
  'autonomous coding',
  'claude code',
  'claude-code',
  'agent skills',
  'agent-skills',
  'mcp server',
  'mcp-server',
  'vibe cod',
  'llm agent',
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

  const name = `${repo.fullName || `${repo.owner || ''}/${repo.name || ''}`}`.toLowerCase();
  const haystack = `${name} ${repo.description || ''}`.toLowerCase();
  if (AI_NAME_KEYWORDS.some((kw) => haystack.includes(kw))) return true;

  // Standalone "AI" as a word: "AI-powered", "native AI capabilities".
  // Word-boundary match so "email", "said", "training" don't false-positive.
  if (/\bai\b/.test(haystack)) return true;

  // Owner branded *ai (paperclipai, stablyai) or repo suffixed -ai (deepseek-ai).
  // Deliberate AI branding; bare repo names ending in "ai" (bonsai, samurai)
  // are excluded to avoid false positives.
  const [owner, repoName] = name.split('/');
  if (owner.endsWith('ai') || (repoName || '').endsWith('-ai')) return true;

  return false;
}
