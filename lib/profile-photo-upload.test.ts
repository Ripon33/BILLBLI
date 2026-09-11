import { describe, expect, it, vi } from "vitest";
import { uploadProfilePhoto } from "./profile-photo-upload";

describe("profile photo upload", () => {
  it("uploads the photo to the authenticated user's profile path", async () => {
    const upload = vi.fn().mockResolvedValue({
      data: { path: "user-123/profile/photo-123.png" },
      error: null,
    });

    const storage = {
      from: vi.fn().mockReturnValue({ upload }),
    };

    const result = await uploadProfilePhoto({
      supabase: { storage } as never,
      userId: "user-123",
      file: new File(["image"], "avatar.png", { type: "image/png" }),
      fileId: "photo-123",
    });

    expect(storage.from).toHaveBeenCalledWith("user-files");
    expect(upload).toHaveBeenCalledWith(
      "user-123/profile/photo-123.png",
      expect.any(File),
      {
        upsert: false,
        cacheControl: "3600",
        contentType: "image/png",
      },
    );
    expect(result).toEqual({
      path: "user-123/profile/photo-123.png",
    });
  });

  it("returns the storage error", async () => {
    const upload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Upload failed" },
    });

    const storage = {
      from: vi.fn().mockReturnValue({ upload }),
    };

    await expect(
      uploadProfilePhoto({
        supabase: { storage } as never,
        userId: "user-123",
        file: new File(["image"], "avatar.png", { type: "image/png" }),
        fileId: "photo-123",
      }),
    ).rejects.toThrow("Upload failed");
  });
});
