import { describe, expect, it } from "vitest";
import {
  classifyHumanDecisionRequirement,
  createWorkDecisionRecord,
  evaluateWorkExecutionGate,
  transitionAuthorizationState,
} from "./work-decision";
import { evaluateWorkDecision } from "./work-engine";
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


describe("Fail-closed work execution gate", () => {
  it("allows proceed with no authorization required", () => {
    const result = evaluateWorkExecutionGate({
      classification: "proceed",
      authorization: "not_required",
      requiresHumanDecision: false,
      requiresAuthorization: false,
      canExecute: true,
      reason: "Ordinary task.",
    });

    expect(result.allowed).toBe(true);
    expect(result.authorization).toBe("not_required");
  });

  it("blocks when human decision is required", () => {
    const result = evaluateWorkExecutionGate({
      classification: "human_decision_required",
      authorization: "human_decision_required",
      requiresHumanDecision: true,
      requiresAuthorization: false,
      canExecute: false,
      reason: "Human decision required.",
    });

    expect(result.allowed).toBe(false);
  });

  it("blocks pending approval", () => {
    const result = evaluateWorkExecutionGate({
      classification: "authorization_required",
      authorization: "pending_approval",
      requiresHumanDecision: false,
      requiresAuthorization: true,
      canExecute: false,
      reason: "Approval required.",
    });

    expect(result.allowed).toBe(false);
  });

  it("blocks approved work until explicitly authorized", () => {
    const result = evaluateWorkExecutionGate({
      classification: "authorization_required",
      authorization: "approved",
      requiresHumanDecision: false,
      requiresAuthorization: true,
      canExecute: false,
      reason: "Explicit authorization required.",
    });

    expect(result.allowed).toBe(false);
  });

  it("allows explicitly authorized work", () => {
    const result = evaluateWorkExecutionGate({
      classification: "authorization_required",
      authorization: "authorized",
      requiresHumanDecision: false,
      requiresAuthorization: true,
      canExecute: true,
      reason: "Authorized.",
    });

    expect(result.allowed).toBe(true);
    expect(result.authorization).toBe("authorized");
  });

  it("blocks an already blocked decision", () => {
    const result = evaluateWorkExecutionGate({
      classification: "blocked",
      authorization: "blocked",
      requiresHumanDecision: false,
      requiresAuthorization: false,
      canExecute: false,
      reason: "Blocked.",
    });

    expect(result.allowed).toBe(false);
  });

  it("fails closed for inconsistent execution permission", () => {
    const result = evaluateWorkExecutionGate({
      classification: "blocked",
      authorization: "blocked",
      requiresHumanDecision: false,
      requiresAuthorization: false,
      canExecute: true,
      reason: "Inconsistent state.",
    });

    expect(result.allowed).toBe(false);
  });
});

describe("Work Engine decision integration", () => {
  it("requires a human decision for a consequential work item", () => {
    const work = {
      id: "work-2",
      title: "Terminate employee",
      goal: "Decide whether the employee should be terminated.",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    };

    const evaluation = evaluateWorkDecision(work);

    expect(evaluation.classification).toBe("human_decision_required");
    expect(evaluation.authorization).toBe("human_decision_required");
    expect(evaluation.requiresHumanDecision).toBe(true);
    expect(evaluation.requiresAuthorization).toBe(true);
    expect(evaluation.canExecute).toBe(false);
  });

  it("requires authorization for approval autonomy", () => {
    const work = {
      id: "work-3",
      title: "Prepare competitor report",
      goal: "Prepare the report for review.",
      status: "draft",
      priority: "normal",
      autonomy: "approval",
      authorization: "required",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    };

    const evaluation = evaluateWorkDecision(work);

    expect(evaluation.classification).toBe("authorization_required");
    expect(evaluation.authorization).toBe("pending_approval");
    expect(evaluation.requiresAuthorization).toBe(true);
    expect(evaluation.canExecute).toBe(false);
  });

  it("keeps restricted work blocked even when legacy authorization is authorized", () => {
    const work = {
      id: "work-5",
      title: "Execute restricted operation",
      goal: "Perform an operation that is restricted from ordinary execution.",
      status: "draft",
      priority: "normal",
      autonomy: "restricted",
      authorization: "authorized",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    };

    const evaluation = evaluateWorkDecision(work);

    expect(evaluation.classification).toBe("authorization_required");
    expect(evaluation.authorization).toBe("authorized");
    expect(evaluation.requiresAuthorization).toBe(true);
    expect(evaluation.canExecute).toBe(false);
  });

  it("allows explicitly authorized approval work", () => {
    const work = {
      id: "work-4",
      title: "Prepare competitor report",
      goal: "Prepare the report for review.",
      status: "draft",
      priority: "normal",
      autonomy: "approval",
      authorization: "authorized",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    };

    const evaluation = evaluateWorkDecision(work);

    expect(evaluation.classification).toBe("authorization_required");
    expect(evaluation.authorization).toBe("authorized");
    expect(evaluation.requiresAuthorization).toBe(true);
    expect(evaluation.canExecute).toBe(true);
  });

  it("evaluates an ordinary auto work item as proceed", () => {
    const work = {
      id: "work-1",
      title: "Research competitors",
      goal: "Compare three competitors and summarize their pricing.",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    };

    const evaluation = evaluateWorkDecision(work);

    expect(evaluation.classification).toBe("proceed");
    expect(evaluation.authorization).toBe("not_required");
    expect(evaluation.requiresHumanDecision).toBe(false);
    expect(evaluation.requiresAuthorization).toBe(false);
    expect(evaluation.canExecute).toBe(true);
  });
});
