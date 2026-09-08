import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerPage from "./page";

const mockGetWork = vi.fn();

vi.mock("@/lib/work-repository", () => ({
  createWorkRepository: () => ({
    getWork: mockGetWork,
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/supabase/auth", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1" }),
}));

describe("WorkerPage", () => {
  it("renders the persistent worker workspace for an owned worker", async () => {
    mockGetWork.mockResolvedValue({
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
    });

    const html = renderToStaticMarkup(
      await WorkerPage({ params: Promise.resolve({ id: "worker-1" }) }),
    );

    expect(html).toContain("Maya");
    expect(html).toContain("Digital Marketer");
    expect(html).toContain("Ask Maya");
  });

  it("rejects a Work record that is not an AI worker", async () => {
    mockGetWork.mockResolvedValue({
      id: "work-1",
      title: "Regular Work",
      goal: "Complete regular work.",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      createdAt: "2026-09-09T00:00:00.000Z",
      updatedAt: "2026-09-09T00:00:00.000Z",
    });

    await expect(
      WorkerPage({ params: Promise.resolve({ id: "work-1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rejects a missing worker", async () => {
    mockGetWork.mockResolvedValue(null);

    await expect(
      WorkerPage({ params: Promise.resolve({ id: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
