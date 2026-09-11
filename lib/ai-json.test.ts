import { describe, expect, it, vi } from "vitest";

const { generate } = vi.hoisted(() => ({
  generate: vi.fn().mockResolvedValue({
    text: '{"answer":"BILLBLI"}',
  }),
}));

vi.mock("./ai/openai-provider", () => ({
  OpenAIProvider: class {
    generate = generate;
  },
}));

import { generateJsonWithAI } from "./ai-json";

describe("AI JSON helper", () => {
  it("exports a reusable JSON generation function", () => {
    expect(generateJsonWithAI).toBeTypeOf("function");
  });

  it("uses the OpenAI provider for JSON generation", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");

    const result = await generateJsonWithAI("Return JSON.");

    expect(generate).toHaveBeenCalledWith({
      capability: "structured_json",
      mode: "balanced",
      input: "Return JSON.",
    });

    expect(result).toBe('{"answer":"BILLBLI"}');
  });
});
