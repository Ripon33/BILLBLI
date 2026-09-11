import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { runResearch } = vi.hoisted(() => ({
  runResearch: vi.fn(),
}));

vi.mock("@/lib/research-runner", () => ({
  runResearch,
}));

const { generateAskWorkerWithAI } = vi.hoisted(() => ({
  generateAskWorkerWithAI: vi.fn().mockResolvedValue(
    "I recommend reviewing the available evidence before taking action.",
  ),
}));

vi.mock("@/lib/ask-worker-ai", () => ({
  generateAskWorkerWithAI,
}));

const getAuthenticatedUserId = vi.fn();
const getWork = vi.fn();

vi.mock("@/lib/work-repository", () => ({
  createWorkRepository: () => ({
    getAuthenticatedUserId,
    getWork,
  }),
}));

describe("POST /api/work/[id]/ask", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    runResearch.mockResolvedValue({
      status: "researched",
      question: "Research our market.",
      plan: {},
      analysis: {},
      language: "en",
      decision: {},
      tradeoffs: {},
      recommendation: {},
      reassessment: {},
      actionPlan: {},
      provenance: {},
      sources: [],
    });
  });

  it("requires authentication", async () => {
    getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/work/worker-1/ask", {
        method: "POST",
        body: JSON.stringify({ message: "Research our market." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("loads the worker through the authenticated repository", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    runResearch.mockResolvedValue({
      status: "researched",
      question: "Research our market.",
      plan: {},
      analysis: {},
      language: "en",
      decision: {},
      tradeoffs: {},
      recommendation: {},
      reassessment: {},
      actionPlan: {},
      provenance: {},
      sources: [],
    });

    getWork.mockResolvedValue({
      id: "worker-1",
      title: "Maya",
      goal: "Grow qualified leads",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      workerType: "digital_marketer",
      workerName: "Maya",
      workerContext: {
        audience: "SMBs",
      },
      createdAt: "2026-09-09T00:00:00.000Z",
      updatedAt: "2026-09-09T00:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/work/worker-1/ask", {
        method: "POST",
        body: JSON.stringify({ message: "Research our market." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(getWork).toHaveBeenCalledWith("worker-1");
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.route).toBe("research");
    expect(data.context).toEqual({
      workerId: "worker-1",
      workerName: "Maya",
      workerType: "digital_marketer",
      workerGoal: "Grow qualified leads",
    });
  });

  it("rejects a missing worker", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    getWork.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/work/missing/ask", {
        method: "POST",
        body: JSON.stringify({ message: "Research our market." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
  });

  it("rejects a regular Work record that is not a worker", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    getWork.mockResolvedValue({
      id: "work-1",
      title: "Normal Work",
      goal: "Complete something",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      createdAt: "2026-09-09T00:00:00.000Z",
      updatedAt: "2026-09-09T00:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/work/work-1/ask", {
        method: "POST",
        body: JSON.stringify({ message: "Help me." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "work-1" }) },
    );

    expect(response.status).toBe(404);
  });

  it("rejects an invalid request body", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    getWork.mockResolvedValue({
      id: "worker-1",
      title: "Maya",
      goal: "Grow qualified leads",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      workerType: "digital_marketer",
      workerName: "Maya",
      createdAt: "2026-09-09T00:00:00.000Z",
      updatedAt: "2026-09-09T00:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/work/worker-1/ask", {
        method: "POST",
        body: JSON.stringify({ message: "   " }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(response.status).toBe(400);
  });
});
