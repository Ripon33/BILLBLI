import { describe, expect, it } from "vitest";
import { buildDecisionActionPlan } from "./decision-action-plan";

describe("decision action plan", () => {
  it("builds ordered actions from decision evidence and context", () => {
    const result = buildDecisionActionPlan({
      recommendation: "proceed",
      confidence: 82,
      decisionFactors: ["Budget: ৳10 lakh", "Location: Cox's Bazar"],
      risks: ["Seasonal demand"],
      tradeoffs: ["Higher investment versus stronger quality"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Validate seasonal demand",
          priority: "critical",
          reason: "Seasonal demand is a material risk to the decision.",
          checkpoint: "Confirm demand remains strong enough to support the decision.",
        },
        {
          action: "Validate the decision budget",
          priority: "important",
          reason: "Budget is a key decision factor.",
          checkpoint: "Confirm the plan remains within the stated budget.",
        },
      ],
    });
  });

  it("does not invent actions when decision information is insufficient", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 35,
    });

    expect(result).toEqual({
      actions: [],
    });
  });
});
