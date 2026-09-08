import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StudyPage from "./workspace/study/page";

describe("workspace study page", () => {
  it("uses the shared workspace destination and real study workspace", () => {
    const html = renderToStaticMarkup(<StudyPage />);

    expect(html).toContain("Structured learning");
    expect(html).toContain("Understand deeply. Practice better.");
    expect(html).toContain("Ask a decision, not just a question.");
    expect(html).toContain("Learn");
    expect(html).toContain("Examples");
    expect(html).toContain("Practice");
  });

  it("renders the study heading only once", () => {
    const html = renderToStaticMarkup(<StudyPage />);

    const matches =
      html.match(/Understand deeply\. Practice better\./g) ?? [];

    expect(matches).toHaveLength(1);
  });
});
