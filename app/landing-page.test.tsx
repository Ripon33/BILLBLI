import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  }),
}));

import LandingPage, { dynamic } from "./page";

describe("public landing page", () => {
  it("uses dynamic rendering for request-time authentication", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("renders a styled BILLBLI landing experience", async () => {
    const html = renderToStaticMarkup(await LandingPage());

    expect(html).toContain("BILLBLI");
    expect(html).toContain("Research deeper. Decide better.");
    expect(html).toContain("Sign in");

    expect(html).toContain("bg-[#f7f7f5]");
    expect(html).toContain("min-h-screen");
  });
});
