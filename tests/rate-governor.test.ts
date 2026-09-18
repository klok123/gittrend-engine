import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RateLimitGovernor } from '../src/engine/rate-governor';

describe('RateLimitGovernor Failover & Backoff', () => {
  it('successfully returns data when no rate limit is hit', async () => {
    let callCount = 0;
    const mockRequest = async () => {
      callCount++;
      return {
        data: { repos: [1, 2, 3] },
        rateLimit: { cost: 5, remaining: 4950, resetAt: '2026-09-19T00:00:00Z' },
      };
    };

    const res = await RateLimitGovernor.executeWithGovernor(mockRequest);
    assert.strictEqual(callCount, 1);
    assert.deepStrictEqual(res.data.repos, [1, 2, 3]);
  });

  it('retries and recovers from transient 429 error with retry-after', async () => {
    let callCount = 0;
    const mockRequest = async () => {
      callCount++;
      if (callCount === 1) {
        const error: any = new Error('Too Many Requests');
        error.status = 429;
        error.headers = { 'retry-after': '0' }; // 0 seconds for fast test
        throw error;
      }
      return {
        data: { success: true },
        rateLimit: { cost: 1, remaining: 4900, resetAt: '2026-09-19T00:00:00Z' },
      };
    };

    const res = await RateLimitGovernor.executeWithGovernor(mockRequest);
    assert.strictEqual(callCount, 2);
    assert.strictEqual(res.data.success, true);
  });
});
