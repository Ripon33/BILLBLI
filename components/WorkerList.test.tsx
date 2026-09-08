import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerList from "./WorkerList";

describe("WorkerList", () => {
  it("renders persisted workers with their specialization and goal", () => {
    const html = renderToStaticMarkup(
      <WorkerList
        workers={[
          {
            id: "worker-1",
            title: "Maya",
            goal: "Grow BILLBLI's digital presence",
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
          },
        ]}
      />,
    );

    expect(html).toContain("Maya");
    expect(html).toContain("Digital Marketer");
    expect(html).toContain("Grow BILLBLI&#x27;s digital presence");
  });

  it("shows an empty state when no workers exist", () => {
    const html = renderToStaticMarkup(<WorkerList workers={[]} />);

    expect(html).toContain("No AI workers yet");
    expect(html).toContain("Create your first persistent worker");
  });
});

describe("WorkerList navigation", () => {
  it("links each persistent worker to its workspace", () => {
    const html = renderToStaticMarkup(
      <WorkerList
        workers={[
          {
            id: "worker-123",
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
          },
        ]}
      />,
    );

    expect(html).toContain('href="/workspace/workers/worker-123"');
  });
});
