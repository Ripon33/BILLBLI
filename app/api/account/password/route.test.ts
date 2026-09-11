import { beforeEach, describe, expect, it, vi } from "vitest";

const { updatePassword } = vi.hoisted(() => ({
  updatePassword: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/password-update", () => ({
  updatePassword,
}));

import { PATCH } from "./route";

describe("password API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the authenticated user's password", async () => {
    updatePassword.mockResolvedValue({
      id: "user-1",
    });

    const response = await PATCH(
      new Request("http://localhost/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "NewSecurePassword123!",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
    });

    expect(updatePassword).toHaveBeenCalledWith({
      password: "NewSecurePassword123!",
    });
  });

  it("returns 400 when the password is invalid", async () => {
    updatePassword.mockRejectedValue(
      new Error("Password must be at least 8 characters"),
    );

    const response = await PATCH(
      new Request("http://localhost/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "short",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Password must be at least 8 characters",
    });
  });

  it("returns 500 when Supabase password update fails", async () => {
    updatePassword.mockRejectedValue(
      new Error("Password update failed"),
    );

    const response = await PATCH(
      new Request("http://localhost/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "NewSecurePassword123!",
        }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to update password.",
    });
  });
});
