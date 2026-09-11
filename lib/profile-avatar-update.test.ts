import { describe, expect, it, vi } from "vitest";
import { updateProfileAvatarPath } from "./profile-avatar-update";

describe("profile avatar metadata", () => {
  it("stores the avatar path in authenticated user metadata", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          user_metadata: {
            avatar_path: "user-123/profile/photo-123.png",
          },
        },
      },
      error: null,
    });

    const supabase = {
      auth: {
        updateUser,
      },
    };

    const result = await updateProfileAvatarPath({
      supabase: supabase as never,
      avatarPath: "user-123/profile/photo-123.png",
    });

    expect(updateUser).toHaveBeenCalledWith({
      data: {
        avatar_path: "user-123/profile/photo-123.png",
      },
    });

    expect(result).toEqual({
      avatarPath: "user-123/profile/photo-123.png",
    });
  });

  it("returns the authentication error", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "Unable to update profile photo" },
    });

    const supabase = {
      auth: {
        updateUser,
      },
    };

    await expect(
      updateProfileAvatarPath({
        supabase: supabase as never,
        avatarPath: "user-123/profile/photo-123.png",
      }),
    ).rejects.toThrow("Unable to update profile photo");
  });
});
