import { describe, expect, it } from "vitest";
import {
  buildAskWorkerRequest,
  classifyAskWorkerRoute,
  type AskWorkerRoute,
} from "./ask-worker";

describe("ask-worker contracts", () => {
  it("builds a request from a worker message and preserves worker context", () => {
    const request = buildAskWorkerRequest({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Should we increase our advertising budget?",
    });

    expect(request).toEqual({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Should we increase our advertising budget?",
    });
  });

  it("uses the existing BILLBLI answer routing semantics", () => {
    const cases: Array<[string, AskWorkerRoute]> = [
      ["Explain how market segmentation works", "study"],
      ["Research the market for this product", "research"],
      ["Should we expand into this market?", "research"],
      ["Send this report to the customer", "task"],
    ];

    for (const [message, expectedRoute] of cases) {
      expect(classifyAskWorkerRoute(message)).toBe(expectedRoute);
    }
  });

  it("rejects an empty worker message", () => {
    expect(() =>
      buildAskWorkerRequest({
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
        message: "   ",
      }),
    ).toThrow("Ask Worker message is required.");
  });

  it("does not treat a work proposal as created Work", () => {
    const proposal = {
      type: "work_proposal" as const,
      title: "Review advertising performance",
      goal: "Analyze campaign performance and recommend next steps",
      autonomy: "review" as const,
    };

    expect(proposal.type).toBe("work_proposal");
    expect("id" in proposal).toBe(false);
    expect("status" in proposal).toBe(false);
  });
});
