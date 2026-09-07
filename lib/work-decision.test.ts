import { describe, expect, it } from "vitest";
import {
  classifyHumanDecisionRequirement,
  createWorkDecisionRecord,
  transitionAuthorizationState,
} from "./work-decision";
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
describe("Human Decision Boundary classification", () => {
  it("requires a human decision for employment decisions", () => {
    const result = classifyHumanDecisionRequirement(
      "Terminate employee",
      "Decide whether to fire the employee",
    );

    expect(result.required).toBe(true);
    expect(result.reason).toBeTruthy();
  });

  it("requires a human decision for financial decisions", () => {
    const result = classifyHumanDecisionRequirement(
      "Approve major payment",
      "Authorize a significant financial transaction",
    );

    expect(result.required).toBe(true);
  });

  it("requires a human decision for legal or compliance decisions", () => {
    const result = classifyHumanDecisionRequirement(
      "Legal compliance action",
      "Make a legal or compliance decision",
    );

    expect(result.required).toBe(true);
  });

  it("requires a human decision for medical or safety decisions", () => {
    const result = classifyHumanDecisionRequirement(
      "Medical decision",
      "Choose a medical treatment",
    );

    expect(result.required).toBe(true);
  });

  it("requires a human decision for destructive or irreversible actions", () => {
    const result = classifyHumanDecisionRequirement(
      "Delete production data",
      "Permanently destroy the production database",
    );

    expect(result.required).toBe(true);
  });

  it("does not require a human decision for ordinary research", () => {
    const result = classifyHumanDecisionRequirement(
      "Research competitors",
      "Research competitors and summarize their pricing",
    );


    expect(result.required).toBe(false);
  });
  it("does not require a human decision for ordinary purchase research", () => {
    const result = classifyHumanDecisionRequirement(
      "Research purchase options",
      "Compare office equipment prices and recommendations",
    );

    expect(result.required).toBe(false);
  });

});

describe("Authorization state transitions", () => {
  it("allows pending approval to become approved", () => {
    const result = transitionAuthorizationState(
      "pending_approval",
      "approve",
    );

    expect(result).toBe("approved");
  });

  it("allows approved authorization to become authorized", () => {
    const result = transitionAuthorizationState(
      "approved",
      "authorize",
    );

    expect(result).toBe("authorized");
  });

  it("allows pending approval to be rejected", () => {
    const result = transitionAuthorizationState(
      "pending_approval",
      "reject",
    );

    expect(result).toBe("rejected");
  });

  it("blocks invalid authorization transitions", () => {
    expect(() =>
      transitionAuthorizationState("rejected", "authorize"),
    ).toThrow();
  });
});
describe("Decision record separation", () => {
  it("preserves an AI recommendation as an AI source", () => {
    const record = createWorkDecisionRecord({
      source: "ai",
      decision: "Recommend option A",
      authorization: "not_required",
    });

    expect(record).toEqual({
      source: "ai",
      decision: "Recommend option A",
      authorization: "not_required",
    });
  });

  it("requires an explicit human source for a human decision", () => {
    const record = createWorkDecisionRecord({
      source: "human",
      decision: "Choose option A",
      authorization: "not_required",
    });

    expect(record.source).toBe("human");
  });

  it("keeps authorization independently represented", () => {
    const record = createWorkDecisionRecord({
      source: "human",
      decision: "Choose option A",
      authorization: "pending_approval",
    });

    expect(record.authorization).toBe("pending_approval");
  });

  it("does not authorize an AI recommendation automatically", () => {
    const record = createWorkDecisionRecord({
      source: "ai",
      decision: "Recommend option A",
      authorization: "not_required",
    });

    expect(record.authorization).not.toBe("authorized");
  });

  it("does not infer authorization merely from a human source", () => {
    const record = createWorkDecisionRecord({
      source: "human",
      decision: "Choose option A",
      authorization: "not_required",
    });

    expect(record.authorization).not.toBe("authorized");
  });
});
