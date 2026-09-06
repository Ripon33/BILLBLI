export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const entries = new Map<string, RateLimitEntry>();

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const existing = entries.get(key);

      if (!existing || now - existing.windowStart >= options.windowMs) {
        entries.set(key, {
          count: 1,
          windowStart: now,
        });

        return {
          allowed: true,
          remaining: Math.max(options.limit - 1, 0),
        };
      }

      if (existing.count >= options.limit) {
        return {
          allowed: false,
          remaining: 0,
        };
      }

      existing.count += 1;

      return {
        allowed: true,
        remaining: Math.max(options.limit - existing.count, 0),
      };
    },
  };
}
