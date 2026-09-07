import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkCreationPanel from "@/components/WorkCreationPanel";

describe("workspace Work Engine integration", () => {
  it("renders Work creation controls", () => {
    const html = renderToStaticMarkup(<WorkCreationPanel />);

    expect(html).toContain("Create Work");
    expect(html).toContain("Work title");
    expect(html).toContain("Work goal");
  });
});
