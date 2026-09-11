import { describe, expect, it, vi } from "vitest";
import { getProfilePhotoUrl } from "./profile-photo-url";

describe("getProfilePhotoUrl", () => {
  it("creates a signed URL for a stored profile photo", async () => {
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: "https://example.com/signed-avatar.png" },
      error: null,
    });

    const supabase = {
      storage: {
        from: vi.fn(() => ({
          createSignedUrl,
        })),
      },
    };

    await expect(
      getProfilePhotoUrl({
        supabase,
        avatarPath: "user-1/profile/avatar-123.png",
      }),
    ).resolves.toBe("https://example.com/signed-avatar.png");

    expect(supabase.storage.from).toHaveBeenCalledWith("user-files");
    expect(createSignedUrl).toHaveBeenCalledWith(
      "user-1/profile/avatar-123.png",
      3600,
    );
  });

  it("returns null when there is no avatar path", async () => {
    const supabase = {
      storage: {
        from: vi.fn(),
      },
    };

    await expect(
      getProfilePhotoUrl({
        supabase,
        avatarPath: undefined,
      }),
    ).resolves.toBeNull();

    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("throws when Supabase cannot create the signed URL", async () => {
    const supabase = {
      storage: {
        from: vi.fn(() => ({
          createSignedUrl: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Storage access denied" },
          }),
        })),
      },
    };

    await expect(
      getProfilePhotoUrl({
        supabase,
        avatarPath: "user-1/profile/avatar-123.png",
      }),
    ).rejects.toThrow("Storage access denied");
  });
});
