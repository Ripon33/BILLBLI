import { describe, expect, it } from "vitest";
import { buildDecisionRecommendation } from "./decision-recommendation";

describe("decision recommendation", () => {
  it("recommends proceeding when the decision score and evidence confidence are strong", () => {
    const result = buildDecisionRecommendation({
      score: 82,
      confidence: 86,
      risks: ["Seasonal demand"],
      tradeoffs: ["Higher quality may require higher upfront cost"],
    });

    expect(result).toMatchObject({
      recommendation: "proceed",
      confidence: 86,
    });

    expect(result.why.length).toBeGreaterThan(0);
    expect(result.risks).toContain("Seasonal demand");
    expect(result.tradeoffs).toContain(
      "Higher quality may require higher upfront cost",
    );
  });

  it("recommends not proceeding when the score or evidence confidence is weak", () => {
    const result = buildDecisionRecommendation({
      score: 42,
      confidence: 35,
      risks: ["Weak demand evidence"],
      tradeoffs: [],
    });

    expect(result.recommendation).toBe("do_not_proceed");
    expect(result.confidence).toBe(35);
    expect(result.why.length).toBeGreaterThan(0);
  });

  it("downgrades a high-score decision when material risks are present", () => {
    const result = buildDecisionRecommendation({
      score: 82,
      confidence: 86,
      risks: ["Major seasonal demand risk"],
      tradeoffs: ["Higher investment versus stronger quality"],
    });

    expect(result.recommendation).toBe("conditional");
    expect(result.confidence).toBe(86);
    expect(result.risks).toContain("Major seasonal demand risk");
    expect(result.tradeoffs).toContain("Higher investment versus stronger quality");
  });

  it("recommends a conditional decision when evidence is mixed", () => {
    const result = buildDecisionRecommendation({
      score: 64,
      confidence: 58,
      risks: ["Seasonal demand"],
      tradeoffs: ["Lower cost versus lower capacity"],
    });

    expect(result.recommendation).toBe("conditional");
    expect(result.confidence).toBe(58);
    expect(result.risks).toContain("Seasonal demand");
    expect(result.tradeoffs).toContain("Lower cost versus lower capacity");
  });
});
