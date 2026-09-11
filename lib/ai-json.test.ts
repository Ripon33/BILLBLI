import { beforeEach, describe, expect, it, vi } from "vitest";

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
  beforeEach(() => {
    generate.mockReset();
    generate.mockResolvedValue({
      text: '{"answer":"BILLBLI"}',
    });
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
  });
  it("exports a reusable JSON generation function", () => {
    expect(generateJsonWithAI).toBeTypeOf("function");
  });

  it("uses the OpenAI provider for JSON generation", async () => {
    const result = await generateJsonWithAI("Return JSON.");

    expect(generate).toHaveBeenCalledWith({
      capability: "structured_json",
      mode: "balanced",
      input: "Return JSON.",
    });

    expect(result).toBe('{"answer":"BILLBLI"}');
  });

  it("uses OpenAI without requiring a secondary provider key", async () => {
    generate.mockResolvedValueOnce({
      text: "```json\n{\"answer\":\"OpenAI only\"}\n```",
    });

    const result = await generateJsonWithAI("Return JSON.");

    expect(result).toBe('{"answer":"OpenAI only"}');
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("propagates OpenAI failures without attempting another provider", async () => {

    generate.mockRejectedValueOnce(new Error("OpenAI unavailable"));

    await expect(generateJsonWithAI("Return JSON.")).rejects.toThrow(
      "OpenAI unavailable",
    );
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
