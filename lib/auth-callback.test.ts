import { describe, expect, it, vi } from "vitest";

describe("OAuth callback", () => {
  it("exchanges the authorization code and redirects to the workspace", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null,
    });

    const { handleAuthCallback } = await import("./auth/callback");

    const result = await handleAuthCallback({
      code: "oauth-code",
      exchangeCodeForSession,
    });

    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
    expect(result).toBe("/workspace");
  });

  it("redirects to sign-in when the callback has no code", async () => {
    const exchangeCodeForSession = vi.fn();

    const { handleAuthCallback } = await import("./auth/callback");

    const result = await handleAuthCallback({
      code: null,
      exchangeCodeForSession,
    });

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(result).toBe("/sign-in");
  });

  it("redirects to sign-in when code exchange fails", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: new Error("Invalid OAuth code"),
    });

    const { handleAuthCallback } = await import("./auth/callback");

    const result = await handleAuthCallback({
      code: "invalid-code",
      exchangeCodeForSession,
    });

    expect(result).toBe("/sign-in");
  });
});
