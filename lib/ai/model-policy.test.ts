import { describe, expect, it } from "vitest";
import {
  getAIModelPolicy,
  type AIModelPolicy,
} from "./model-policy";

describe("AI model policy", () => {
  it("returns a policy for every BILLBLI intelligence mode", () => {
    for (const mode of ["auto", "fast", "balanced", "best_quality"] as const) {
      const policy = getAIModelPolicy(mode);

      expect(policy).toMatchObject({
        mode,
        provider: "openai",
      });
      expect(policy.model).toBeTruthy();
    }
  });

  it("keeps provider model selection centralized", () => {
    const policy: AIModelPolicy = getAIModelPolicy("balanced");

    expect(policy.provider).toBe("openai");
    expect(typeof policy.model).toBe("string");
    expect(policy.model.length).toBeGreaterThan(0);
  });

  it("uses BILLBLI product modes rather than exposing provider choices", () => {
    const policy = getAIModelPolicy("best_quality");

    expect(policy.mode).toBe("best_quality");
    expect(policy).not.toHaveProperty("providerModelName");
  });
});
