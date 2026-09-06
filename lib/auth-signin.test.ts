import { describe, expect, it, vi } from "vitest";

describe("authentication sign-in", () => {
  it("signs in with email and password", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    });

    const { signInWithEmail } = await import("./auth/signin");

    await signInWithEmail({
      email: "user@example.com",
      password: "secure-password",
      signInWithPassword,
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secure-password",
    });
  });

  it("starts Google sign-in with the auth callback URL", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });

    const { signInWithGoogle } = await import("./auth/signin");

    const result = await signInWithGoogle({ signInWithOAuth });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    });
    expect(result.url).toBe("https://accounts.google.com/oauth");
  });

  it("uses the remember-me preference when setting session persistence", async () => {
    const setSessionPersistence = vi.fn().mockResolvedValue(undefined);

    const { applyRememberMe } = await import("./auth/signin");

    await applyRememberMe(true, setSessionPersistence);

    expect(setSessionPersistence).toHaveBeenCalledWith(true);
  });

  it("signs out the current user", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    const { signOutUser } = await import("./auth/signin");

    await signOutUser(signOut);

    expect(signOut).toHaveBeenCalledOnce();
  });

  it("returns authentication errors", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: new Error("Invalid login credentials"),
    });

    const { signInWithEmail } = await import("./auth/signin");

    await expect(
      signInWithEmail({
        email: "user@example.com",
        password: "wrong-password",
        signInWithPassword,
      }),
    ).rejects.toThrow("Invalid login credentials");
  });
});
