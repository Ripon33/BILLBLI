import { describe, expect, it, vi } from "vitest";
import { runResearch } from "./research-runner";

describe("research runner", () => {
  it("returns the complete BILLBLI research result from injected research dependencies", async () => {
    const result = await runResearch(
      "Research the market for this product",
      {
        search: vi.fn().mockResolvedValue([
          {
            title: "Market research report",
            url: "https://example.gov/market-research",
            content:
              "Official market research data and statistics describe market demand, customers, growth opportunities, pricing conditions, and competitive market analysis for this product category.",
            score: 0.9,
          },
        ]),
        generate: vi.fn().mockResolvedValue(
          JSON.stringify({
            decision: "Proceed with further validation.",
            confidence: 70,
            summary: "The evidence supports further validation.",
            key_facts: [
              {
                fact: "Example factual finding",
                sources: [1],
              },
            ],
            evidence_for: [
              {
                point: "Supporting evidence",
                sources: [1],
              },
            ],
            evidence_against: [],
            risks: ["Limited evidence"],
            assumptions: ["Example assumption"],
            conflicts: [],
            what_would_change_the_decision: ["New contradictory evidence"],
          }),
        ),
      },
    );

    expect(result.status).toBe("researched");
    expect(result.question).toBe("Research the market for this product");
    expect(result.plan).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.tradeoffs).toBeDefined();
    expect(result.recommendation).toBeDefined();
    expect(result.reassessment).toBeDefined();
    expect(result.actionPlan).toBeDefined();
    expect(result.provenance).toBeDefined();
    expect(result.sources).toBeDefined();
  });
});

it("attaches detected language metadata to the returned decision", async () => {
  const result = await runResearch(
    "এই পণ্যের বাজার নিয়ে গবেষণা করুন",
    {
      search: vi.fn().mockResolvedValue([
        {
          title: "Market research report",
          url: "https://example.gov/market-research",
          content:
            "Official market research data and statistics describe market demand, customers, growth opportunities, pricing conditions, and competitive market analysis for this product category.",
          score: 0.9,
        },
      ]),
      generate: vi.fn().mockResolvedValue(
        JSON.stringify({
          decision: "Proceed with further validation.",
          confidence: 70,
          summary: "The evidence supports further validation.",
          key_facts: [{ fact: "Example factual finding", sources: [1] }],
          evidence_for: [{ point: "Supporting evidence", sources: [1] }],
          evidence_against: [],
          risks: ["Limited evidence"],
          assumptions: ["Example assumption"],
          conflicts: [],
          what_would_change_the_decision: ["New contradictory evidence"],
        }),
      ),
    },
  );

  expect(result.decision.language).toEqual({
    input: "bn",
    output: "bn",
  });
});
