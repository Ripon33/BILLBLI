import { describe, expect, it } from "vitest";
import type {
  WorkAuthorizationState,
  WorkDecisionClassification,
  WorkDecisionEvaluation,
} from "./work-decision";

describe("Work Decision domain types", () => {
  it("represents all decision classifications", () => {
    const classifications: WorkDecisionClassification[] = [
      "proceed",
      "human_decision_required",
      "authorization_required",
      "blocked",
    ];

    expect(classifications).toHaveLength(4);
  });

  it("represents all authorization states", () => {
    const states: WorkAuthorizationState[] = [
      "not_required",
      "human_decision_required",
      "pending_approval",
      "approved",
      "rejected",
      "authorized",
      "blocked",
    ];

    expect(states).toHaveLength(7);
  });

  it("represents a complete decision evaluation", () => {
    const evaluation: WorkDecisionEvaluation = {
      classification: "proceed",
      authorization: "not_required",
      requiresHumanDecision: false,
      requiresAuthorization: false,
      canExecute: true,
      reason: "No human decision or authorization is required.",
    };

    expect(evaluation.classification).toBe("proceed");
    expect(evaluation.authorization).toBe("not_required");
    expect(evaluation.canExecute).toBe(true);
  });
});