import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ResearchPage from "./workspace/research/page";

describe("workspace research page", () => {
  it("uses the shared workspace destination and real research workspace", () => {
    const html = renderToStaticMarkup(<ResearchPage />);

    expect(html).toContain("Evidence-first research");
    expect(html).toContain("Research deeper. Decide better.");
    expect(html).toContain("Ask a decision, not just a question.");
    expect(html).toContain("Multiple sources");
    expect(html).toContain("Evidence &amp; conflicts");
    expect(html).toContain("Clear recommendation");
  });

  it("renders the research heading only once", () => {
    const html = renderToStaticMarkup(<ResearchPage />);

    const matches = html.match(/Research deeper\. Decide better\./g) ?? [];

    expect(matches).toHaveLength(1);
  });
});
