import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BillbliWork } from "@/lib/work-engine";
import { WorkStatus } from "./WorkStatus";
import { WorkCard } from "./WorkCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

const work: BillbliWork = {
  id: "work-1",
  title: "Research accounting software",
  goal: "Compare the strongest options and recommend the best fit.",
  status: "waiting_approval",
  priority: "high",
  autonomy: "approval",
  authorization: "required",
  createdAt: "2026-09-08T06:00:00.000Z",
  updatedAt: "2026-09-08T06:10:00.000Z",
};

describe("WorkStatus", () => {
  it("renders a human-readable lifecycle status", () => {
    const html = renderToStaticMarkup(<WorkStatus status="waiting_approval" />);

    expect(html).toContain("Waiting approval");
    expect(html).toContain("role=\"status\"");
  });

  it("represents completed and failed states distinctly", () => {
    const completed = renderToStaticMarkup(
      <WorkStatus status="completed" />,
    );
    const failed = renderToStaticMarkup(
      <WorkStatus status="failed" />,
    );

    expect(completed).toContain("Completed");
    expect(failed).toContain("Failed");
  });
});

describe("WorkCard", () => {
  it("renders the important Work Engine fields", () => {
    const html = renderToStaticMarkup(<WorkCard work={work} />);

    expect(html).toContain("Research accounting software");
    expect(html).toContain(
      "Compare the strongest options and recommend the best fit.",
    );
    expect(html).toContain("Waiting approval");
    expect(html).toContain("High");
    expect(html).toContain("Approval");
    expect(html).toContain("Required");
  });

  it("supports optional actions without changing work data", () => {
    const html = renderToStaticMarkup(
      <WorkCard
        work={work}
        actions={<button type="button">Review</button>}
      />,
    );

    expect(html).toContain("Review");
    expect(html).toContain("work-1");
  });
});

describe("EmptyState", () => {
  it("renders an intentional empty state with an optional action", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        title="No Work yet"
        description="Create a Work item to get started."
        action={<button type="button">Create Work</button>}
      />,
    );

    expect(html).toContain("No Work yet");
    expect(html).toContain("Create a Work item to get started.");
    expect(html).toContain("Create Work");
  });
});

describe("LoadingState", () => {
  it("renders an accessible loading state", () => {
    const html = renderToStaticMarkup(
      <LoadingState message="Loading Work..." />,
    );

    expect(html).toContain("Loading Work...");
    expect(html).toContain("aria-busy=\"true\"");
    expect(html).toContain("role=\"status\"");
  });
});

describe("ErrorState", () => {
  it("renders an actionable error state", () => {
    const html = renderToStaticMarkup(
      <ErrorState
        title="Unable to load Work"
        message="Please try again."
        action={<button type="button">Retry</button>}
      />,
    );

    expect(html).toContain("Unable to load Work");
    expect(html).toContain("Please try again.");
    expect(html).toContain("Retry");
  });

  it("can render without an action", () => {
    const html = renderToStaticMarkup(
      <ErrorState
        title="Something went wrong"
        message="The Work item could not be loaded."
      />,
    );

    expect(html).toContain("Something went wrong");
    expect(html).toContain("The Work item could not be loaded.");
  });
});
