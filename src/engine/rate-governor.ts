export interface RateLimitState {
  cost: number;
  remaining: number;
  resetAt: string;
}

export class RateLimitGovernor {
  public static readonly EMERGENCY_FLOOR = 500;
  public static readonly BASE_PACING_MS = 300;
  public static readonly MAX_RETRIES = 3;

  public static async executeWithGovernor<T>(
    requestFn: () => Promise<{ data: T; rateLimit?: RateLimitState; headers?: Headers | Record<string, string> }>
  ): Promise<{ data: T; rateLimit?: RateLimitState }> {
    let attempt = 0;

    while (attempt <= this.MAX_RETRIES) {
      try {
        // Enforce basic pacing interval
        await new Promise((resolve) => setTimeout(resolve, this.BASE_PACING_MS));

        const result = await requestFn();

        if (result.rateLimit) {
          const { remaining, resetAt } = result.rateLimit;
          if (remaining < this.EMERGENCY_FLOOR) {
            console.warn(`[RATE_GOVERNOR] Emergency floor reached: ${remaining} points left. Reset at ${resetAt}`);
          }
        }

        return result;
      } catch (error: any) {
        attempt++;
        const status = error.status || error.response?.status;

        // Check for secondary rate limit (403 abuse detection) or 429
        if (status === 403 || status === 429) {
          let retryAfterSeconds: number | null = null;

          if (error.response?.headers?.get) {
            const val = error.response.headers.get('retry-after');
            if (val) retryAfterSeconds = parseInt(val, 10);
          } else if (error.headers && error.headers['retry-after']) {
            retryAfterSeconds = parseInt(error.headers['retry-after'], 10);
          }

          let delayMs = 0;
          if (retryAfterSeconds && !isNaN(retryAfterSeconds)) {
            delayMs = retryAfterSeconds * 1000 + Math.random() * 1000;
          } else {
            delayMs = Math.min(60000, Math.pow(2, attempt) * 1000 + Math.random() * 1000);
          }

          console.warn(`[RATE_GOVERNOR] Hit 403/429. Backing off for ${Math.round(delayMs)}ms (attempt ${attempt}/${this.MAX_RETRIES})`);

          if (attempt > this.MAX_RETRIES) {
            throw new Error(`[RATE_GOVERNOR] Exceeded maximum retries (${this.MAX_RETRIES}). Aborting request.`);
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          throw error;
        }
      }
    }

    throw new Error('[RATE_GOVERNOR] Unexpected termination.');
  }
}
