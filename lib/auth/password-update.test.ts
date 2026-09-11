import { describe, expect, it, vi } from "vitest";
import { updatePassword } from "./password-update";

describe("updatePassword", () => {
  it("updates the authenticated user's password", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      error: null,
    });

    const result = await updatePassword({
      password: "NewSecurePassword123!",
      updateUser,
    });

    expect(updateUser).toHaveBeenCalledWith({
      password: "NewSecurePassword123!",
    });
    expect(result).toEqual({
      id: "user-1",
    });
  });

  it("requires a password", async () => {
    const updateUser = vi.fn();

    await expect(
      updatePassword({
        password: "   ",
        updateUser,
      }),
    ).rejects.toThrow("Password is required");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("requires a minimum password length", async () => {
    const updateUser = vi.fn();

    await expect(
      updatePassword({
        password: "short",
        updateUser,
      }),
    ).rejects.toThrow("Password must be at least 8 characters");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("returns the Supabase error", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: null,
      },
      error: new Error("Password update failed"),
    });

    await expect(
      updatePassword({
        password: "NewSecurePassword123!",
        updateUser,
      }),
    ).rejects.toThrow("Password update failed");
  });
});
