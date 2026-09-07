import { describe, expect, it } from "vitest";
import {
  createExecution,
  createTaskResult,
  setVerificationStatus,
  type ExecutionStatus,
  type VerificationStatus,
} from "./work-execution";

describe("work execution", () => {
  it("represents all approved execution states", () => {
    const states: ExecutionStatus[] = [
      "queued",
      "running",
      "succeeded",
      "failed",
      "blocked",
    ];

    expect(states).toHaveLength(5);
  });

  it("blocks execution when the decision gate denies execution", () => {
    const execution = createExecution({
      taskId: "task-blocked",
      decision: {
        classification: "human_decision_required",
        authorization: "human_decision_required",
        requiresHumanDecision: true,
        requiresAuthorization: true,
        canExecute: false,
        reason: "Human decision is required before execution.",
      },
    });

    expect(execution.status).toBe("blocked");
  });

  it("does not execute work with approval that is not authorization", () => {
    const execution = createExecution({
      taskId: "task-approved-only",
      decision: {
        classification: "authorization_required",
        authorization: "approved",
        requiresHumanDecision: false,
        requiresAuthorization: true,
        canExecute: true,
        reason: "Approval exists but explicit authorization is still required.",
      },
    });

    expect(execution.status).toBe("blocked");
  });

  it("fails closed when decision state is inconsistent", () => {
    const execution = createExecution({
      taskId: "task-inconsistent",
      decision: {
        classification: "proceed",
        authorization: "blocked",
        requiresHumanDecision: false,
        requiresAuthorization: false,
        canExecute: true,
        reason: "Inconsistent execution state.",
      },
    });

    expect(execution.status).toBe("blocked");
  });

  it("does not execute restricted work even when legacy authorization is authorized", () => {
    const execution = createExecution({
      taskId: "task-restricted",
      decision: {
        classification: "authorization_required",
        authorization: "authorized",
        requiresHumanDecision: false,
        requiresAuthorization: true,
        canExecute: false,
        reason: "Restricted work cannot execute through ordinary execution.",
      },
    });

    expect(execution.status).toBe("blocked");
  });

  it("creates a queued execution for a task", () => {
    const execution = createExecution({
      taskId: "task-1",
      decision: {
        classification: "proceed",
        authorization: "not_required",
        requiresHumanDecision: false,
        requiresAuthorization: false,
        canExecute: true,
        reason: "Work is permitted to execute.",
      },
    });

    expect(execution).toEqual({
      id: expect.any(String),
      taskId: "task-1",
      status: "queued",
    });
  });

  it("creates a structured task result", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    expect(result).toEqual({
      id: expect.any(String),
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
      status: "succeeded",
      verificationStatus: "unverified",
    });
  });

  it("keeps execution completion separate from verification", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    expect(result.status).toBe("succeeded");
    expect(result.verificationStatus).toBe("unverified");
    expect(result).not.toHaveProperty("verified");
  });
});


describe("work execution verification", () => {
  it("represents all approved verification states", () => {
    const states: VerificationStatus[] = [
      "unverified",
      "verified",
      "verification_failed",
    ];

    expect(states).toHaveLength(3);
  });

  it("starts every task result as unverified", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    expect(result.verificationStatus).toBe("unverified");
  });

  it("allows a result to become explicitly verified", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    const verified = setVerificationStatus(result, "verified");

    expect(verified.verificationStatus).toBe("verified");
  });

  it("allows verification to fail explicitly", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    const failed = setVerificationStatus(result, "verification_failed");

    expect(failed.verificationStatus).toBe("verification_failed");
  });

  it("does not report a result as verified without explicit verification", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    expect(result.verificationStatus).not.toBe("verified");
  });
});
