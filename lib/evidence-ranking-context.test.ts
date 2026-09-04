import { describe, expect, it } from "vitest";
import { rankEvidenceSources } from "./evidence-ranking";
import type { EvidenceSource } from "./evidence-ranking";
import { extractDecisionContext } from "./decision-context";
import { scoreResearchContextFit } from "./research-context";

describe("context-aware evidence ranking", () => {
  it("prioritizes evidence that matches the decision location", () => {
    const question = "Should I open a coffee shop?";
    const context = extractDecisionContext(
      "Should I open a coffee shop in Cox's Bazar?"
    );

    const sources: EvidenceSource[] = [
      {
        title: "Coffee shop demand in Dhaka",
        content: "Coffee shop demand and customers in Dhaka.",
        url: "https://example.com/dhaka-coffee",
        score: 0.9,
      },
      {
        title: "Coffee shop demand in Cox's Bazar",
        content: "Coffee shop demand and customers in Cox's Bazar.",
        url: "https://example.com/coxs-bazar-coffee",
        score: 0.9,
      },
    ];

    const ranked = rankEvidenceSources(question, sources, context);
    expect(ranked[0].title).toBe("Coffee shop demand in Cox's Bazar");
  });
});
