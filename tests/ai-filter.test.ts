import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isAiRepo } from '../src/lib/ai-filter';

describe('ai-filter', () => {
  it('flags agent-era topics', () => {
    for (const topic of ['agent-skills', 'ai-agent', 'agentic-ai', 'coding-agents', 'claude-code', 'mcp-server']) {
      assert.equal(
        isAiRepo({ fullName: `acme/tool`, topics: [topic], description: 'A developer tool' }),
        true,
        `topic ${topic} should be flagged`
      );
    }
  });

  it('flags agent-era description fragments', () => {
    assert.equal(
      isAiRepo({ fullName: 'acme/tool', topics: [], description: 'A coding agent for your terminal' }),
      true
    );
    assert.equal(
      isAiRepo({ fullName: 'acme/agentic-framework', topics: [], description: 'Dev tools' }),
      true
    );
  });

  it('does not false-positive on innocent words', () => {
    for (const desc of [
      'Send email campaigns faster',
      'As I said before, a fast CLI',
      'Bonsai tree simulator in Rust',
      'Samurai-themed game engine',
      'ssh-agent key manager',
    ]) {
      assert.equal(
        isAiRepo({ fullName: 'acme/tool', topics: [], description: desc }),
        false,
        `description "${desc}" should NOT be flagged`
      );
    }
  });

  it('does not flag plain non-AI repos', () => {
    assert.equal(
      isAiRepo({
        fullName: 'tobi/disktree',
        topics: ['treemap', 'disk-analysis', 'rust'],
        description: 'A treemap for finding and removing what fills your disk',
      }),
      false
    );
  });
});
