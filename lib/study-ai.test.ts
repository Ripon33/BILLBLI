import { describe, expect, it, vi } from "vitest";

const generate = vi.fn().mockResolvedValue({
  text: JSON.stringify({
    type: "study",
    explanation: "BILLBLI helps users learn clearly.",
    examples: ["Example one"],
    practiceQuestions: ["What is BILLBLI?"],
  }),
});

vi.mock("./ai/openai-provider", () => ({
  OpenAIProvider: class {
    generate = generate;
  },
}));

describe("Study AI", () => {
  it("uses the AI provider with the structured JSON capability", async () => {
    const { generateStudyWithAI } = await import("./study-ai");

    const result = await generateStudyWithAI(
      "Explain BILLBLI",
      "en",
    );

    expect(generate).toHaveBeenCalledWith({
      capability: "structured_json",
      mode: "balanced",
      input: expect.stringContaining(
        "BILLBLI's Study & Learning assistant",
      ),
    });

    expect(result).toBeTypeOf("string");
  });
});
