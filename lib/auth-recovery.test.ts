import { describe, expect, it, vi } from "vitest";

describe("password recovery", () => {
  it("requests a password reset email with the auth callback URL", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    const { requestPasswordReset } = await import("./auth/recovery");

    await requestPasswordReset({
      email: "user@example.com",
      resetPasswordForEmail,
    });

    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    );
  });

  it("returns the reset request error", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({
      data: {},
      error: new Error("Unable to send reset email"),
    });

    const { requestPasswordReset } = await import("./auth/recovery");

    await expect(
      requestPasswordReset({
        email: "user@example.com",
        resetPasswordForEmail,
      }),
    ).rejects.toThrow("Unable to send reset email");
  });

  it("updates the password after recovery", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      error: null,
    });

    const { updatePassword } = await import("./auth/recovery");

    await updatePassword({
      password: "new-secure-password",
      updateUser,
    });

    expect(updateUser).toHaveBeenCalledWith({
      password: "new-secure-password",
    });
  });

  it("returns the password update error", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: null,
      },
      error: new Error("Password update failed"),
    });

    const { updatePassword } = await import("./auth/recovery");

    await expect(
      updatePassword({
        password: "new-secure-password",
        updateUser,
      }),
    ).rejects.toThrow("Password update failed");
  });
});
