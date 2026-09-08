import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerWorkspace from "./WorkerWorkspace";

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
