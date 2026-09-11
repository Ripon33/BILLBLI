import { describe, expect, it, vi } from "vitest";

const generate = vi.fn().mockResolvedValue({
  text: "I recommend validating the highest-potential campaign before committing budget.",
});

vi.mock("./ai/openai-provider", () => ({
  OpenAIProvider: class {
    generate = generate;
  },
}));

describe("Ask Worker AI", () => {
  it("uses the text capability with worker context and returns a worker-facing answer", async () => {
    const { generateAskWorkerWithAI } = await import("./ask-worker-ai");

    const result = await generateAskWorkerWithAI({
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Suggest three marketing campaigns and recommend which one I should choose.",
      route: "research",
    });

    expect(generate).toHaveBeenCalledWith({
      capability: "text",
      mode: "balanced",
      input: expect.stringContaining("Maya"),
    });

    expect(generate.mock.calls[0][0].input).toContain("digital_marketer");
    expect(generate.mock.calls[0][0].input).toContain("Grow qualified leads");
    expect(generate.mock.calls[0][0].input).toContain(
      "Suggest three marketing campaigns",
    );
    expect(result).toBe(
      "I recommend validating the highest-potential campaign before committing budget.",
    );
  });
});
