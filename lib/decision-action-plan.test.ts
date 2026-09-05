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
          action:
            "Validate whether the quality gain justifies the additional investment",
          priority: "important",
          reason:
            "The investment versus quality trade-off is material to the decision.",
          checkpoint:
            "Confirm the expected quality gain is sufficient to justify the additional investment.",
        },
        {
          action: "Validate the decision budget",
          priority: "important",
          reason: "Budget is a key decision factor.",
          checkpoint: "Confirm the plan remains within the stated budget.",
        },
        {
          action: "Validate location-specific assumptions",
          priority: "important",
          reason: "Location is a key decision factor.",
          checkpoint:
            "Confirm the decision assumptions remain valid for the stated location.",
        },
      ],
    });
  });

  it("builds a validation action for a generic material risk", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      risks: ["High setup cost"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Validate setup cost",
          priority: "critical",
          reason: "High setup cost is a material risk to the decision.",
          checkpoint: "Confirm the setup cost remains acceptable for the decision.",
        },
      ],
    });
  });

  it("builds a validation action for high setup cost", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      risks: ["High setup cost"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Validate setup cost",
          priority: "critical",
          reason: "High setup cost is a material risk to the decision.",
          checkpoint:
            "Confirm the setup cost remains acceptable for the decision.",
        },
      ],
    });
  });

  it("builds an action for a meaningful investment versus quality trade-off", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      tradeoffs: ["Higher investment versus stronger quality"],
    });

    expect(result).toEqual({
      actions: [
        {
          action:
            "Validate whether the quality gain justifies the additional investment",
          priority: "important",
          reason:
            "The investment versus quality trade-off is material to the decision.",
          checkpoint:
            "Confirm the expected quality gain is sufficient to justify the additional investment.",
        },
      ],
    });
  });

  it("builds an action for a cost versus reliability trade-off", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      tradeoffs: ["Lower cost versus lower reliability"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Validate whether the reliability trade-off is acceptable",
          priority: "important",
          reason:
            "The cost versus reliability trade-off is material to the decision.",
          checkpoint:
            "Confirm the lower reliability remains acceptable for the expected cost savings.",
        },
      ],
    });
  });

  it("builds a verification action for regulatory uncertainty", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      risks: ["Regulatory uncertainty"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Verify applicable licensing requirements",
          priority: "critical",
          reason: "Regulatory uncertainty is a material risk to the decision.",
          checkpoint:
            "Confirm the applicable licensing requirements before acting on the decision.",
        },
      ],
    });
  });

  it("asks for stronger evidence when confidence is low", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 35,
      risks: ["Regulatory uncertainty"],
    });

    expect(result.actions).toContainEqual({
      action: "Gather stronger evidence",
      priority: "critical",
      reason: "Low decision confidence means stronger evidence is needed before acting.",
      checkpoint: "Reassess the decision after materially stronger evidence is available.",
    });
  });

  it("builds a validation action for a location decision factor", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      decisionFactors: ["Location: Cox's Bazar"],
    });

    expect(result).toEqual({
      actions: [
        {
          action: "Validate location-specific assumptions",
          priority: "important",
          reason: "Location is a key decision factor.",
          checkpoint:
            "Confirm the decision assumptions remain valid for the stated location.",
        },
      ],
    });
  });

  it("does not invent actions for an unsupported trade-off", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 72,
      tradeoffs: ["Something may be better but could also be different"],
    });

    expect(result).toEqual({
      actions: [],
    });
  });

  it("does not invent actions when decision information is insufficient", () => {
    const result = buildDecisionActionPlan({
      recommendation: "conditional",
      confidence: 35,
      decisionFactors: [],
      risks: [],
      tradeoffs: [],
    });

    expect(result).toEqual({
      actions: [],
    });
  });
});
