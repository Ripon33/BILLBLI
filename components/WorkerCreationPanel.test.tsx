import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerCreationPanel from "./WorkerCreationPanel";

describe("WorkerCreationPanel", () => {
  it("accepts an onCreated callback for successful worker creation", () => {
    const onCreated = vi.fn();

    const html = renderToStaticMarkup(
      <WorkerCreationPanel onCreated={onCreated} />,
    );

    expect(html).toContain("Create Worker");
  });
});
