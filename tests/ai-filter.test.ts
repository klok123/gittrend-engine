import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isAiRepo } from '../src/lib/ai-filter';

// Regression cases from the 2026-09-26 Jev live audit: these obviously-AI
// repos were passing through /trending/without-ai and the "Hide AI/ML" chip.
describe('AI filter — agentic-era coverage', () => {
  it('catches agent-era topics', () => {
    for (const topic of ['agent-skills', 'ai-agent', 'agentic-ai', 'coding-agents', 'claude-code']) {
      assert.ok(isAiRepo({ topics: [topic], fullName: 'some/repo' }), `topic ${topic}`);
    }
  });

  it('catches agentic descriptions', () => {
    const cases: Array<[string, string]> = [
      ['anomalyco/tool', 'The open source coding agent'],
      ['cline/cline', 'Autonomous coding agent for software engineers'],
      ['anthropics/skills', 'Public repository for Agent Skills'],
      ['addyosmani/skills', 'Engineering skills for AI coding agents'],
      ['n8n-io/n8n', 'Workflow automation with native AI capabilities'],
    ];
    for (const [fullName, description] of cases) {
      assert.ok(isAiRepo({ fullName, description }), fullName);
    }
  });

  it('catches *-ai branded owners', () => {
    assert.ok(isAiRepo({ fullName: 'paperclipai/paperclip', description: 'Manage agents at work' }));
    assert.ok(isAiRepo({ fullName: 'stablyai/orca', description: 'Fleet of parallel agents' }));
    assert.ok(isAiRepo({ fullName: 'deepseek-ai/harness', description: 'Eval harness' }));
  });

  it('does not false-positive on non-AI repos', () => {
    const cases: Array<[string, string]> = [
      ['termux/termux-app', 'Android terminal emulator and Linux environment'],
      ['some/mailer', 'A transactional email client that never said no'],
      ['johndoe/bonsai', 'Grow virtual bonsai trees on your desktop'],
      ['johndoe/samurai', 'A fast static site generator'],
      ['some/ssh-tool', 'Manage your ssh-agent identities with ease'],
    ];
    for (const [fullName, description] of cases) {
      assert.ok(!isAiRepo({ fullName, description }), fullName);
    }
  });
});
