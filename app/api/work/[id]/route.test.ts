import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

const getAuthenticatedUserId = vi.fn();
const getWork = vi.fn();
const updateWork = vi.fn();

vi.mock("@/lib/work-repository", () => ({
  createWorkRepository: () => ({
    getAuthenticatedUserId,
    getWork,
    updateWork,
  }),
}));

const worker = {
  id: "worker-1",
  title: "Maya",
  goal: "Grow qualified leads",
  status: "draft" as const,
  priority: "normal" as const,
  autonomy: "review" as const,
  authorization: "not_required" as const,
  workerType: "digital_marketer" as const,
  workerName: "Maya",
  createdAt: "2026-09-09T00:00:00.000Z",
  updatedAt: "2026-09-09T00:00:00.000Z",
};

describe("PATCH /api/work/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserId.mockResolvedValue("user-1");
    getWork.mockResolvedValue(worker);
    updateWork.mockResolvedValue({
      ...worker,
      autonomy: "approval",
      authorization: "required",
      updatedAt: "2026-09-11T12:00:00.000Z",
    });
  });

  it("requires authentication", async () => {
    getAuthenticatedUserId.mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost/api/work/worker-1", {
        method: "PATCH",
        body: JSON.stringify({ autonomy: "approval" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(response.status).toBe(401);
    expect(updateWork).not.toHaveBeenCalled();
  });

  it("rejects a missing Work record", async () => {
    getWork.mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost/api/work/missing", {
        method: "PATCH",
        body: JSON.stringify({ autonomy: "approval" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    expect(updateWork).not.toHaveBeenCalled();
  });

  it("rejects an invalid autonomy level", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/work/worker-1", {
        method: "PATCH",
        body: JSON.stringify({ autonomy: "unrestricted" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(response.status).toBe(400);
    expect(updateWork).not.toHaveBeenCalled();
  });

  it("updates autonomy through the authenticated owner-scoped repository", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/work/worker-1", {
        method: "PATCH",
        body: JSON.stringify({ autonomy: "approval" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "worker-1" }) },
    );

    expect(response.status).toBe(200);
    expect(getWork).toHaveBeenCalledWith("worker-1");
    expect(updateWork).toHaveBeenCalledWith("worker-1", {
      autonomy: "approval",
    });

    const data = await response.json();
    expect(data.work.autonomy).toBe("approval");
    expect(data.work.authorization).toBe("required");
  });
});
