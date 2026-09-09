import { describe, expect, it, vi } from "vitest";
import {
  orchestrateAskWorker,
  type AskWorkerOrchestrationResult,
} from "./ask-worker-orchestration";

const researchDependencies = {
  search: vi.fn().mockResolvedValue([
    {
      title: "Market research report",
      url: "https://example.gov/market-research",
      content:
        "Official market research data and statistics describe market demand, customers, growth opportunities, pricing conditions, and competitive market analysis for this product category.",
      score: 0.9,
    },
  ]),
  generate: vi.fn().mockResolvedValue(
    JSON.stringify({
      decision: "Proceed with further validation.",
      confidence: 70,
      summary: "The evidence supports further validation.",
      key_facts: [{ fact: "Example factual finding", sources: [1] }],
      evidence_for: [{ point: "Supporting evidence", sources: [1] }],
      evidence_against: [],
      risks: ["Limited evidence"],
      assumptions: ["Example assumption"],
      conflicts: [],
      what_would_change_the_decision: ["New contradictory evidence"],
    }),
  ),
};

describe("governed Ask Worker orchestration", () => {
  it("routes a worker request through the existing BILLBLI route", async () => {
    const result = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Research the market for this product",
    },
    {
      research: researchDependencies,
    },
    );

    expect(result.route).toBe("research");
    expect(result.stages).toEqual([
      "understanding",
      "routing",
      "research",
      "synthesis",
    ]);
  });

  it("preserves the worker identity and goal in orchestration context", async () => {
    const result = await orchestrateAskWorker({
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

  it("does not create Work during orchestration", async () => {
    const result = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Review our advertising performance and suggest next steps",
    });

    expect(result.workProposal).toBeUndefined();
    expect("id" in result).toBe(false);
  });

  it("represents a governed response without granting authorization", async () => {
    const result: AskWorkerOrchestrationResult = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Should we increase our advertising budget?",
    },
    {
      research: researchDependencies,
    },
    );

    expect(result.governance).toEqual({
      recommendationIsAuthorization: false,
      requiresHumanAuthorization: false,
      externalExecutionAllowed: false,
    });
  });

  it("requires human authorization for human-decision requests without granting execution", async () => {
    const result = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "hr_assistant",
      workerGoal: "Support responsible people operations",
      message: "Should we terminate employee?",
    });

    expect(result.governance).toEqual({
      recommendationIsAuthorization: false,
      requiresHumanAuthorization: true,
      externalExecutionAllowed: false,
    });
  });

  it("proposes editable Work without creating it", async () => {
    const result = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "Review our advertising performance every week",
      workProposal: {
        type: "work_proposal",
        title: "Review advertising performance",
        goal: "Review our advertising performance every week",
        autonomy: "review",
      },
    });

    expect(result.workProposal).toEqual({
      type: "work_proposal",
      title: "Review advertising performance",
      goal: "Review our advertising performance every week",
      autonomy: "review",
    });
  });

  it("does not invent a Work proposal when none is supplied", async () => {
    const result = await orchestrateAskWorker({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
      message: "How should we improve our campaign?",
    });

    expect(result.workProposal).toBeUndefined();
  });

  it("includes the real research result when a research route is executed", async () => {
    const result = await orchestrateAskWorker(
      {
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
        message: "Research the market for this product",
      },
      {
        research: {
          search: vi.fn().mockResolvedValue([
            {
              title: "Market research report",
              url: "https://example.gov/market-research",
              content:
                "Official market research data and statistics describe market demand, customers, growth opportunities, pricing conditions, and competitive market analysis for this product category.",
              score: 0.9,
            },
          ]),
          generate: vi.fn().mockResolvedValue(
            JSON.stringify({
              decision: "Proceed with further validation.",
              confidence: 70,
              summary: "The evidence supports further validation.",
              key_facts: [{ fact: "Example factual finding", sources: [1] }],
              evidence_for: [{ point: "Supporting evidence", sources: [1] }],
              evidence_against: [],
              risks: ["Limited evidence"],
              assumptions: ["Example assumption"],
              conflicts: [],
              what_would_change_the_decision: ["New contradictory evidence"],
            }),
          ),
        },
      },
    );

    expect(result.route).toBe("research");
    expect(result.research).toBeDefined();
    expect(result.research?.status).toBe("researched");
    expect(result.research?.analysis).toBeDefined();
    expect(result.research?.decision).toBeDefined();
    expect(result.research?.recommendation).toBeDefined();
    expect(result.research?.provenance).toBeDefined();
    expect(result.research?.sources).toBeDefined();
  });

  it("rejects an empty message", async () => {
    await expect(
      orchestrateAskWorker({
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
        message: "   ",
      }),
    ).rejects.toThrow("Ask Worker message is required.");
  });
});
