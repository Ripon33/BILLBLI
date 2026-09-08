import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerDirectory from "./WorkerDirectory";

describe("WorkerDirectory", () => {
  it("renders the worker directory shell", () => {
    const html = renderToStaticMarkup(<WorkerDirectory />);

    expect(html).toContain("Your workers");
    expect(html).toContain("Loading workers");
  });
});
