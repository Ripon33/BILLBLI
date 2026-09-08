import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/supabase/auth", () => ({
  requireUser: vi.fn().mockResolvedValue(undefined),
}));

import WorkspaceLayout, { dynamic } from "./workspace/layout";

describe("authenticated workspace layout", () => {
  it("uses dynamic rendering for request-time authentication", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("does not render the legacy authenticated navigation", async () => {
    const html = renderToStaticMarkup(
      await WorkspaceLayout({
        children: <div>Workspace content</div>,
      }),
    );

    expect(html).not.toContain("Authenticated workspace navigation");
    expect(html).not.toContain(">Home<");
  });
});
