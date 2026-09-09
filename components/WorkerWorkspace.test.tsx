import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerWorkspace, {
  createAskWorkerSubmission,
  submitAskWorker,
  createAskWorkerState,
  type AskWorkerSubmissionResult,
} from "./WorkerWorkspace";

describe("WorkerWorkspace", () => {
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
