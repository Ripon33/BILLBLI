import { describe, expect, it } from "vitest";
import type {
  AIProvider,
  AIRequest,
  AIResult,
} from "./provider";

describe("AI provider contract", () => {
  it("accepts a provider implementation through a stable interface", async () => {
    const provider: AIProvider = {
      name: "test",
      generate: async (_request: AIRequest): Promise<AIResult> => ({
        text: "provider result",
      }),
    };

    const result = await provider.generate({
      capability: "text",
      mode: "balanced",
      input: "Hello BILLBLI.",
    });

    expect(provider.name).toBe("test");
    expect(result).toEqual({
      text: "provider result",
    });
  });

  it("keeps provider identity separate from the AI request", () => {
    const request: AIRequest = {
      capability: "reasoning",
      mode: "best_quality",
      input: "Analyze this decision.",
    };

    expect(request).not.toHaveProperty("provider");
    expect(request).not.toHaveProperty("model");
  });
});
