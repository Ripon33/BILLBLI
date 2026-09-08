import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkersPage from "./page";

describe("WorkersPage", () => {
  it("renders the real AI workforce creation interface", () => {
    const html = renderToStaticMarkup(<WorkersPage />);

    expect(html).toContain("AI Workforce");
    expect(html).toContain("Persistent AI workers");
    expect(html).toContain("Create AI Worker");
    expect(html).toContain("Specialization");
    expect(html).toContain("Worker name");
    expect(html).toContain("Goal");
    expect(html).toContain("Autonomy");
    expect(html).toContain("Your workers");
    expect(html).toContain("Loading workers...");
  });

  it("does not render the temporary demo worker", () => {
    const html = renderToStaticMarkup(<WorkersPage />);

    expect(html).not.toContain("<h1>Maya</h1>");
    expect(html).not.toContain("Build and manage our digital marketing pipeline.");
  });
});
