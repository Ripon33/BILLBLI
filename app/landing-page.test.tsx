import { describe, expect, it } from "vitest";
import LandingPage, { dynamic } from "./page";

describe("public landing page", () => {
  it("uses dynamic rendering for request-time authentication", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("exports the landing page", () => {
    expect(LandingPage).toBeTypeOf("function");
  });
});
