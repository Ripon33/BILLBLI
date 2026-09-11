import { updateCurrentProfile } from "./profile-update";
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

describe("profile avatar updates", () => {
  it("persists the avatar storage path in authenticated user metadata", async () => {
    const updateCalls: Array<{
      data: { full_name: string; avatar_path: string };
    }> = [];

    const result = await updateCurrentProfile({
      fullName: "Test User",
      avatarPath: "user-1/profile/avatar-123.png",
      getUser: async () => ({
        data: {
          user: {
            id: "user-1",
            email: "user@example.com",
            user_metadata: {
              full_name: "Old Name",
            },
          },
        },
        error: null,
      }),
      updateUser: async (attributes) => {
        updateCalls.push(attributes);

        return {
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
              user_metadata: {
                full_name: attributes.data.full_name,
                avatar_path: attributes.data.avatar_path,
              },
            },
          },
          error: null,
        };
      },
    });

    expect(updateCalls).toEqual([
      {
        data: {
          full_name: "Test User",
          avatar_path: "user-1/profile/avatar-123.png",
        },
      },
    ]);

    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      fullName: "Test User",
      avatarPath: "user-1/profile/avatar-123.png",
    });
  });
});

describe("profile avatar path validation", () => {
  it("rejects a malformed avatar path even when it starts with the current user's folder", async () => {
    await expect(
      updateCurrentProfile({
        fullName: "Test User",
        avatarPath: "user-1/profile/../../private.txt",
        getUser: async () => ({
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
              user_metadata: { full_name: "Test User" },
            },
          },
          error: null,
        }),
        updateUser: async () => ({
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
              user_metadata: { full_name: "Test User" },
            },
          },
          error: null,
        }),
      }),
    ).rejects.toThrow("Invalid avatar path.");
  });
});

describe("profile avatar ownership", () => {
  it("rejects an avatar path that belongs to another user", async () => {
    await expect(
      updateCurrentProfile({
        fullName: "Test User",
        avatarPath: "another-user/profile/avatar-123.png",
        getUser: async () => ({
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
              user_metadata: {
                full_name: "Test User",
              },
            },
          },
          error: null,
        }),
        updateUser: async () => ({
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
              user_metadata: {
                full_name: "Test User",
              },
            },
          },
          error: null,
        }),
      }),
    ).rejects.toThrow("Invalid avatar path.");
  });
});
