import { describe, expect, it } from "vitest";
import {
  orchestrateAskWorker,
  type AskWorkerOrchestrationResult,
} from "./ask-worker-orchestration";

describe("governed Ask Worker orchestration", () => {
  it("routes a worker request through the existing BILLBLI route", () => {
    const result = orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Research the market for this product",
    });

    expect(result.route).toBe("research");
    expect(result.stages).toEqual([
      "understanding",
      "routing",
      "research",
      "synthesis",
    ]);
  });

  it("preserves the worker identity and goal in orchestration context", () => {
    const result = orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "How should we improve our campaign?",
    });

    expect(result.context).toEqual({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
    });
  });

  it("does not create Work during orchestration", () => {
    const result = orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Review our advertising performance and suggest next steps",
    });

    expect(result.workProposal).toBeUndefined();
    expect("id" in result).toBe(false);
  });

  it("represents a governed response without granting authorization", () => {
    const result: AskWorkerOrchestrationResult = orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Should we increase our advertising budget?",
    });

    expect(result.governance).toEqual({
      recommendationIsAuthorization: false,
      requiresHumanAuthorization: false,
      externalExecutionAllowed: false,
    });
  });

  it("rejects an empty message", () => {
    expect(() =>
      orchestrateAskWorker({
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
        message: "   ",
      }),
    ).toThrow("Ask Worker message is required.");
  });
});
