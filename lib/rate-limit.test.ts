import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("research rate limiter", () => {
  it("allows the first 10 requests and blocks the 11th", () => {
    const limiter = createRateLimiter({
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    for (let i = 0; i < 10; i++) {
      expect(limiter.check("203.0.113.10").allowed).toBe(true);
    }

    expect(limiter.check("203.0.113.10").allowed).toBe(false);
  });

  it("tracks different IP addresses independently", () => {
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 10 * 60 * 1000,
    });

    expect(limiter.check("203.0.113.10").allowed).toBe(true);
    expect(limiter.check("203.0.113.10").allowed).toBe(false);

    expect(limiter.check("203.0.113.11").allowed).toBe(true);
  });
});

  it("resets the request count after the window expires", () => {
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 10 * 60 * 1000,
    });

    const start = 1_000_000;

    expect(limiter.check("203.0.113.12", start).allowed).toBe(true);
    expect(limiter.check("203.0.113.12", start + 1).allowed).toBe(false);

    expect(
      limiter.check("203.0.113.12", start + 10 * 60 * 1000).allowed,
    ).toBe(true);
  });
