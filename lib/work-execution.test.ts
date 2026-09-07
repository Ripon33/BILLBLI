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

  it("creates a queued execution for a task", () => {
    const execution = createExecution({
      taskId: "task-1",
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
