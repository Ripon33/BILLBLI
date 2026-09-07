import { describe, expect, it } from "vitest";
import {
  createExecution,
  createTaskResult,
  type ExecutionStatus,
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
    });
  });

  it("keeps execution completion separate from verification", () => {
    const result = createTaskResult({
      taskId: "task-1",
      executionId: "execution-1",
      output: "Research completed",
    });

    expect(result).not.toHaveProperty("verified");
    expect(result).not.toHaveProperty("verificationStatus");
  });
});
