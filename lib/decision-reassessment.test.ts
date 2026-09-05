import { describe, expect, it } from "vitest";
import { buildDecisionReassessment } from "./decision-reassessment";

describe("decision reassessment", () => {
  it("identifies what could change a conditional decision", () => {
    const result = buildDecisionReassessment({
      recommendation: "conditional",
      confidence: 78,
      risks: ["Seasonal demand risk"],
      tradeoffs: ["Higher investment versus stronger quality"],
    });

    expect(result.reassessmentTriggers.length).toBeGreaterThan(0);
    expect(result.whatWouldChange.length).toBeGreaterThan(0);
    expect(result.reassessmentTriggers).toContain("Seasonal demand risk");
  });

  it("identifies stronger evidence as a trigger when confidence is low", () => {
    const result = buildDecisionReassessment({
      recommendation: "do_not_proceed",
      confidence: 35,
      risks: [],
      tradeoffs: [],
    });

    expect(result.whatWouldChange).toContain(
      "Stronger evidence could materially change the decision.",
    );
  });

  it("preserves unknown conditions instead of inventing reassessment thresholds", () => {
    const result = buildDecisionReassessment({
      recommendation: "conditional",
      confidence: 78,
      risks: [],
      tradeoffs: [],
    });

    expect(result.reassessmentTriggers).toEqual([]);
    expect(result.whatWouldChange).toEqual([]);
  });
});
