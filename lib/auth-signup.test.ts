import { describe, expect, it, vi } from "vitest";

describe("email signup", () => {
  it("creates an account with email confirmation required", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });

    const { signUpWithEmail } = await import("./auth/signup");

    await signUpWithEmail({
      email: "user@example.com",
      password: "secure-password",
      fullName: "Test User",
      signUp,
    });

    expect(signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secure-password",
      options: {
        data: {
          full_name: "Test User",
        },
        emailRedirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("returns the Supabase signup error", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: null },
      error: new Error("Email already registered"),
    });

    const { signUpWithEmail } = await import("./auth/signup");

    await expect(
      signUpWithEmail({
        email: "user@example.com",
        password: "secure-password",
        fullName: "Test User",
        signUp,
      }),
    ).rejects.toThrow("Email already registered");
  });
});
