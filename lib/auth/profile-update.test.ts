import { describe, expect, it, vi } from "vitest";

describe("profile update", () => {
  it("updates the authenticated user's full name through Supabase Auth", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Updated User",
          },
        },
      },
      error: null,
    });

    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Original User",
          },
        },
      },
      error: null,
    });

    const { updateCurrentProfile } = await import("./profile-update");

    const result = await updateCurrentProfile({
      fullName: "Updated User",
      getUser,
      updateUser,
    });

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith({
      data: {
        full_name: "Updated User",
      },
    });

    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      fullName: "Updated User",
    });
  });

  it("requires an authenticated user", async () => {
    const updateUser = vi.fn();

    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    const { updateCurrentProfile } = await import("./profile-update");

    await expect(
      updateCurrentProfile({
        fullName: "Updated User",
        getUser,
        updateUser,
      }),
    ).rejects.toThrow("Authenticated user is required");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("requires a non-empty full name", async () => {
    const updateUser = vi.fn();
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });

    const { updateCurrentProfile } = await import("./profile-update");

    await expect(
      updateCurrentProfile({
        fullName: "   ",
        getUser,
        updateUser,
      }),
    ).rejects.toThrow("Full name is required");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("returns the Supabase update error", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: null,
      },
      error: new Error("Profile update failed"),
    });

    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });

    const { updateCurrentProfile } = await import("./profile-update");

    await expect(
      updateCurrentProfile({
        fullName: "Updated User",
        getUser,
        updateUser,
      }),
    ).rejects.toThrow("Profile update failed");
  });
});
