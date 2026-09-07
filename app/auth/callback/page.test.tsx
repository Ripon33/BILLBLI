import { describe, expect, it } from "vitest";
import AuthCallbackPage from "./page";

describe("auth callback page", () => {
  it("exports an auth callback page", () => {
    expect(AuthCallbackPage).toBeDefined();
  });

  it("uses the auth callback handler", () => {
    const pageSource = AuthCallbackPage.toString();

    expect(pageSource).toContain("handleAuthCallback");
    expect(pageSource).toContain("exchangeCodeForSession");
  });
});
