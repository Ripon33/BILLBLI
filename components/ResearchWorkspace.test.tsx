import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResearchWorkspace } from "./ResearchWorkspace";

describe("ResearchWorkspace", () => {
  it("renders the core research interaction", () => {
    const html = renderToStaticMarkup(<ResearchWorkspace />);

    expect(html).toContain("Ask BILLBLI");
    expect(html).toContain("Ask a decision, not just a question.");
    expect(html).toContain("Research &amp; Decide");
    expect(html).toContain("Multiple sources");
    expect(html).toContain("Evidence &amp; conflicts");
    expect(html).toContain("Clear recommendation");
  });
});



describe("ResearchWorkspace result rendering", () => {
  it("renders a supplied research result with DecisionBox", () => {
    const result = {
      question: "Should we proceed?",
      analysis: {
        decision: "Proceed with the verified option.",
        confidence: 85,
        summary: "The evidence supports proceeding.",
      },
      sources: [
        {
          title: "Verified source",
          url: "https://example.com",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ResearchWorkspace result={result} />,
    );

    expect(html).toContain("Proceed with the verified option.");
    expect(html).toContain("Decision intelligence");
    expect(html).toContain("Verified source");
  });
});


describe("ResearchWorkspace submission integration", () => {
  it("creates a submission handler that returns the research result", async () => {
    const submitResearch = vi.fn().mockResolvedValue({
      analysis: {
        decision: "Proceed.",
        confidence: 90,
      },
    });

    const { createResearchWorkspaceHandler } = await import(
      "./ResearchWorkspace"
    );

    const handler = createResearchWorkspaceHandler(submitResearch);

    const result = await handler("Should we proceed?");

    expect(submitResearch).toHaveBeenCalledWith("Should we proceed?");
    expect(result).toEqual({
      analysis: {
        decision: "Proceed.",
        confidence: 90,
      },
    });
  });
});
