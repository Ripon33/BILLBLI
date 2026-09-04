import { describe, expect, it } from "vitest";
import { getDecisionBoxSummary } from "./decision-box";

const emptyContext = {
  decision_factors: [],
  risks: [],
  assumptions: [],
  conflicts: [],
  reassessment_triggers: [],
};

describe("DecisionBox V2 summary", () => {
  it("maps the V2 decision into display-ready summary data", () => {
    const result = getDecisionBoxSummary({
      recommendation: "Proceed with the business",
      score: 82,
      confidence: 91,
      rationale: "Strong demand and economics.",
      state: "RECOMMENDATION",
      ...emptyContext,
    });

    expect(result.recommendation).toBe("Proceed with the business");
    expect(result.score).toBe(82);
    expect(result.confidence).toBe(91);
    expect(result.rationale).toBe("Strong demand and economics.");
    expect(result.state).toBe("RECOMMENDATION");
  });

  it("includes the six decision factors with their scores and evidence strength", () => {
    const result = getDecisionBoxSummary({
      recommendation: "Proceed",
      score: 82,
      confidence: 91,
      rationale: "Strong evidence.",
      state: "RECOMMENDATION",
      ...emptyContext,
      decision_factors: [
        {
          name: "Market / Demand",
          score: 88,
          weight: 25,
          evidence_strength: 84,
          explanation: "Strong demand signals.",
        },
        {
          name: "Economics / ROI",
          score: 80,
          weight: 20,
          evidence_strength: 78,
          explanation: "Attractive economics.",
        },
        {
          name: "Feasibility",
          score: 76,
          weight: 15,
          evidence_strength: 72,
          explanation: "Technically feasible.",
        },
        {
          name: "Competition",
          score: 70,
          weight: 10,
          evidence_strength: 68,
          explanation: "Moderate competition.",
        },
        {
          name: "Risk",
          score: 65,
          weight: 15,
          evidence_strength: 61,
          explanation: "Manageable risks.",
        },
        {
          name: "Regulation / Constraints",
          score: 74,
          weight: 15,
          evidence_strength: 70,
          explanation: "No major constraints found.",
        },
      ],
    });

    expect(result.decision_factors).toHaveLength(6);
    expect(result.decision_factors[0]).toMatchObject({
      name: "Market / Demand",
      score: 88,
      weight: 25,
      evidence_strength: 84,
    });
  });

  it("preserves decision context for risks, assumptions, conflicts, and reassessment", () => {
    const result = getDecisionBoxSummary({
      recommendation: "Proceed",
      score: 82,
      confidence: 91,
      rationale: "Strong evidence.",
      state: "RECOMMENDATION",
      decision_factors: [],
      risks: ["Demand may weaken"],
      assumptions: ["Pricing remains stable"],
      conflicts: [{ id: "conflict-1", severity: "minor" }],
      reassessment_triggers: ["Reassess if demand falls below target"],
    });

    expect(result.risks).toEqual(["Demand may weaken"]);
    expect(result.assumptions).toEqual(["Pricing remains stable"]);
    expect(result.conflicts).toHaveLength(1);
    expect(result.reassessment_triggers).toEqual([
      "Reassess if demand falls below target",
    ]);
  });
});
