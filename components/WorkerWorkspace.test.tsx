import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerWorkspace, {
  createAskWorkerSubmission,
  submitAskWorker,
  submitWorkProposal,
  createAskWorkerState,
  createWorkProposalSubmission,
  createReviewedWorkInput,
  createWorkAutonomyUpdate,
  AskWorkerResearchResult,
  AskWorkerWorkProposalReview,
  type AskWorkerSubmissionResult,
} from "./WorkerWorkspace";

describe("WorkerWorkspace", () => {
  it("renders the actual governed research result", () => {
    const research = {
      status: "researched" as const,
      question: "Should we expand our campaign?",
      plan: {} as never,
      analysis: {
        decision: "Expansion is promising.",
        confidence: 0.82,
        summary: "The available evidence supports expansion.",
        key_facts: [],
        evidence_for: [],
        evidence_against: [],
        risks: ["Budget exposure"],
        assumptions: ["Current demand continues"],
        conflicts: [],
        what_would_change_the_decision: ["Demand weakens"],
      },
      language: "en" as const,
      decision: {} as never,
      tradeoffs: {} as never,
      recommendation: {} as never,
      reassessment: {} as never,
      actionPlan: {} as never,
      provenance: {} as never,
      sources: [
        {
          id: 1,
          title: "Market report",
          url: "https://example.gov/report",
          score: 0.9,
          authority: 0.95,
          authority_type: "government",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <AskWorkerResearchResult research={research} />,
    );

    expect(html).toContain("The available evidence supports expansion.");
    expect(html).toContain("Expansion is promising.");
    expect(html).toContain("Budget exposure");
    expect(html).toContain("Demand weakens");
    expect(html).toContain("Market report");
  });

  it("renders persistent worker identity, specialization, goal, and control state", () => {
    const html = renderToStaticMarkup(
      <WorkerWorkspace
        worker={{
          id: "worker-1",
          title: "Maya",
          goal: "Build and manage our digital marketing pipeline.",
          status: "draft",
          priority: "normal",
          autonomy: "review",
          authorization: "not_required",
          workerType: "digital_marketer",
          workerName: "Maya",
          workerContext: {
            workerType: "digital_marketer",
            workerName: "Maya",
          },
          createdAt: "2026-09-09T00:00:00.000Z",
          updatedAt: "2026-09-09T00:00:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Maya");
    expect(html).toContain("Digital Marketer");
    expect(html).toContain(
      "Build and manage our digital marketing pipeline.",
    );
    expect(html).toContain("Review");
    expect(html).toContain("Ask Maya");
  });

  it("renders an interactive autonomy control with all governed levels", () => {
    const html = renderToStaticMarkup(
      <WorkerWorkspace
        worker={{
          id: "worker-1",
          title: "Maya",
          goal: "Build and manage our digital marketing pipeline.",
          status: "draft",
          priority: "normal",
          autonomy: "review",
          authorization: "not_required",
          workerType: "digital_marketer",
          workerName: "Maya",
          createdAt: "2026-09-09T00:00:00.000Z",
          updatedAt: "2026-09-09T00:00:00.000Z",
        }}
      />,
    );

    expect(html).toContain('aria-label="Worker autonomy"');
    expect(html).toContain("Auto");
    expect(html).toContain("Review");
    expect(html).toContain("Approval");
    expect(html).toContain("Restricted");
  });

  it("creates a governed autonomy update request", () => {
    const result = createWorkAutonomyUpdate({
      workerId: "worker-1",
      autonomy: "approval",
    });

    expect(result).toEqual({
      url: "/api/work/worker-1",
      init: {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          autonomy: "approval",
        }),
      },
    });

    expect(JSON.stringify(result)).not.toContain("authorization");
  });
});


describe("WorkerWorkspace Ask Worker interaction", () => {
  it("creates the authenticated worker API request", () => {
    const result = createAskWorkerSubmission({
      workerId: "worker-1",
      message: "Research our market.",
    });

    expect(result).toEqual({
      url: "/api/work/worker-1/ask",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: "Research our market.",
        }),
      },
    });
  });

  it("rejects an empty message before making a request", () => {
    expect(() =>
      createAskWorkerSubmission({
        workerId: "worker-1",
        message: "   ",
      }),
    ).toThrow("Ask Worker message is required.");
  });

  it("does not create Work when submitting an Ask Worker request", () => {
    const result = createAskWorkerSubmission({
      workerId: "worker-1",
      message: "Review our campaign.",
    });

    expect("work" in result).toBe(false);
    expect("createWork" in result).toBe(false);
  });

  it("preserves the research result for Worker Workspace presentation", () => {
    const result = createAskWorkerState({
      route: "research",
      stages: ["understanding", "routing", "research", "synthesis"],
      context: {
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
      },
      governance: {
        recommendationIsAuthorization: false,
        requiresHumanAuthorization: false,
        externalExecutionAllowed: false,
      },
      research: {
        answer: "The market is growing.",
        sources: [
          {
            title: "Market report",
            url: "https://example.gov/report",
          },
        ],
      },
    });

    expect(result.result?.research?.answer).toBe("The market is growing.");
    expect(result.result?.research?.sources).toHaveLength(1);
  });

  it("preserves an explicit Work proposal from the governed API response", () => {
    const result: AskWorkerSubmissionResult = {
      route: "research",
      stages: ["research", "synthesis"],
      answer: "I recommend reviewing the campaign evidence before taking action.",
      context: {
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Build and manage our digital marketing pipeline.",
      },
      governance: {
        recommendationIsAuthorization: false,
        requiresHumanAuthorization: false,
        externalExecutionAllowed: false,
      },
      workProposal: {
        type: "work_proposal",
        title: "Launch campaign review",
        goal: "Review campaign performance and prepare the next campaign plan.",
        autonomy: "review",
      },
    };

    expect(result.workProposal).toEqual({
      type: "work_proposal",
      title: "Launch campaign review",
      goal: "Review campaign performance and prepare the next campaign plan.",
      autonomy: "review",
    });
  });

  it("presents the actual governed research result", () => {
    const result = createAskWorkerState({
      route: "research",
      stages: ["understanding", "routing", "research", "synthesis"],
      context: {
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
      },
      governance: {
        recommendationIsAuthorization: false,
        requiresHumanAuthorization: false,
        externalExecutionAllowed: false,
      },
      research: {
        status: "researched",
        question: "Should we expand our campaign?",
        plan: {} as never,
        analysis: {
          decision: "Expansion is promising.",
          confidence: 0.82,
          summary: "The available evidence supports expansion.",
          key_facts: [],
          evidence_for: [],
          evidence_against: [],
          risks: [],
          assumptions: [],
          conflicts: [],
          what_would_change_the_decision: [],
        },
        language: "en",
        decision: {} as never,
        tradeoffs: {} as never,
        recommendation: {} as never,
        reassessment: {} as never,
        actionPlan: {} as never,
        provenance: {} as never,
        sources: [
          {
            id: 1,
            title: "Market report",
            url: "https://example.gov/report",
            score: 0.9,
            authority: 0.95,
            authority_type: "government",
          },
        ],
      },
    });

    expect(result.result?.research?.analysis.summary).toBe(
      "The available evidence supports expansion.",
    );
    expect(result.result?.research?.recommendation).toBeDefined();
    expect(result.result?.research?.sources).toHaveLength(1);
  });

  it("renders a proposed Work for human review with editable fields", () => {
    const html = renderToStaticMarkup(
      <AskWorkerWorkProposalReview
        proposal={{
          type: "work_proposal",
          title: "Launch campaign review",
          goal: "Review campaign performance and prepare the next campaign plan.",
          autonomy: "review",
        }}
      />,
    );

    expect(html).toContain("Review before creating Work");
    expect(html).toContain("Work title");
    expect(html).toContain("Work goal");
    expect(html).toContain("Launch campaign review");
    expect(html).toContain(
      "Review campaign performance and prepare the next campaign plan.",
    );
    expect(html).toContain("Create Work");
  });

  it("creates an explicit Work submission from the reviewed proposal", () => {
    const result = createWorkProposalSubmission({
      title: "Launch campaign review",
      goal: "Review campaign performance and prepare the next campaign plan.",
    });

    expect(result).toEqual({
      url: "/api/work",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Launch campaign review",
          goal: "Review campaign performance and prepare the next campaign plan.",
        }),
      },
    });
  });

  it("submits the reviewed Work proposal only through the existing Work API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        work: {
          id: "work-1",
          title: "Launch campaign review",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await submitWorkProposal({
      title: "Launch campaign review",
      goal: "Review campaign performance and prepare the next campaign plan.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/work",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Launch campaign review",
          goal: "Review campaign performance and prepare the next campaign plan.",
        }),
      }),
    );
    expect(result.work.id).toBe("work-1");

    vi.unstubAllGlobals();
  });

  it("wires the reviewed proposal to an explicit create callback", () => {
    const calls: Array<{ title: string; goal: string }> = [];

    const html = renderToStaticMarkup(
      <AskWorkerWorkProposalReview
        proposal={{
          type: "work_proposal",
          title: "Launch campaign review",
          goal: "Review campaign performance and prepare the next campaign plan.",
          autonomy: "review",
        }}
        onCreateWork={(input) => {
          calls.push(input);
        }}
      />,
    );

    expect(html).toContain("Create Work");
    expect(calls).toEqual([]);
  });

  it("uses reviewed proposal values when creating Work", () => {
    const calls: Array<{ title: string; goal: string }> = [];

    const result = createReviewedWorkInput({
      title: "  Updated campaign review  ",
      goal: "  Prepare the revised campaign plan.  ",
    });

    calls.push(result);

    expect(calls).toEqual([
      {
        title: "Updated campaign review",
        goal: "Prepare the revised campaign plan.",
      },
    ]);
  });

  it("returns the created Work from an explicit proposal submission", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        work: {
          id: "work-1",
          title: "Launch campaign review",
          goal: "Review campaign performance and prepare the next campaign plan.",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await submitWorkProposal({
      title: "Launch campaign review",
      goal: "Review campaign performance and prepare the next campaign plan.",
    });

    expect(result).toEqual({
      work: {
        id: "work-1",
        title: "Launch campaign review",
        goal: "Review campaign performance and prepare the next campaign plan.",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("can consume the governed API response without granting authorization", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            route: "research",
            stages: ["understanding", "routing", "research", "synthesis"],
            context: {
              workerId: "worker-1",
              workerName: "Maya",
              workerType: "digital_marketer",
              workerGoal: "Grow qualified leads",
            },
            governance: {
              recommendationIsAuthorization: false,
              requiresHumanAuthorization: false,
              externalExecutionAllowed: false,
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const submission = createAskWorkerSubmission({
      workerId: "worker-1",
      message: "Research our market.",
    });

    const response = await fetch(submission.url, submission.init);
    const result = (await response.json()) as AskWorkerSubmissionResult;

    expect(result.route).toBe("research");
    expect(result.governance.recommendationIsAuthorization).toBe(false);
    expect(result.governance.externalExecutionAllowed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockRestore();
  });

  it("submits the Ask Worker request and returns the governed response", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            route: "research",
            stages: ["understanding", "routing", "research", "synthesis"],
            context: {
              workerId: "worker-1",
              workerName: "Maya",
              workerType: "digital_marketer",
              workerGoal: "Grow qualified leads",
            },
            governance: {
              recommendationIsAuthorization: false,
              requiresHumanAuthorization: false,
              externalExecutionAllowed: false,
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const result = await submitAskWorker({
      workerId: "worker-1",
      message: "Research our market.",
    });

    expect(result.route).toBe("research");
    expect(result.stages).toEqual([
      "understanding",
      "routing",
      "research",
      "synthesis",
    ]);
    expect(result.governance.externalExecutionAllowed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockRestore();
  });


  it("starts an Ask Worker interaction in a pending state", () => {
    const state = createAskWorkerState();

    expect(state).toEqual({
      status: "idle",
      result: null,
      error: null,
    });
  });

  it("represents a governed Ask Worker result without treating it as authorization", () => {
    const state = createAskWorkerState({
      route: "research",
      stages: ["understanding", "routing", "research", "synthesis"],
      answer: "I recommend validating the strongest campaign before committing budget.",
      context: {
        workerId: "worker-1",
        workerName: "Maya",
        workerType: "digital_marketer",
        workerGoal: "Grow qualified leads",
      },
      governance: {
        recommendationIsAuthorization: false,
        requiresHumanAuthorization: false,
        externalExecutionAllowed: false,
      },
    });

    expect(state.status).toBe("success");
    expect(state.result?.route).toBe("research");
    expect(state.result?.answer).toBe(
      "I recommend validating the strongest campaign before committing budget.",
    );
    expect(state.result?.governance.recommendationIsAuthorization).toBe(false);
    expect(state.result?.governance.externalExecutionAllowed).toBe(false);
  });


  it("creates an Ask Worker loading state", () => {
    const state = createAskWorkerState("loading");

    expect(state).toEqual({
      status: "loading",
      result: null,
      error: null,
    });
  });

  it("creates an Ask Worker error state", () => {
    const state = createAskWorkerState("error", "Unable to process Ask Worker request.");

    expect(state).toEqual({
      status: "error",
      result: null,
      error: "Unable to process Ask Worker request.",
    });
  });

});
