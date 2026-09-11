import { describe, expect, it, vi } from "vitest";
import { uploadChatAttachment } from "./chat-attachment-upload";

describe("chat attachment upload", () => {
  it("uploads the selected file to the user's chat storage path", async () => {
    const upload = vi.fn().mockResolvedValue({
      data: {
        path: "user-1/chat/attachment-1.pdf",
      },
      error: null,
    });

    const supabase = {
      storage: {
        from: vi.fn(() => ({
          upload,
        })),
      },
    };

    const file = new File(["hello"], "report.pdf", {
      type: "application/pdf",
    });

    const result = await uploadChatAttachment({
      supabase,
      userId: "user-1",
      file,
      fileId: "attachment-1",
    });

    expect(supabase.storage.from).toHaveBeenCalledWith("user-files");
    expect(upload).toHaveBeenCalledWith(
      "user-1/chat/attachment-1.pdf",
      file,
      expect.objectContaining({
        contentType: "application/pdf",
        upsert: false,
      }),
    );
    expect(result).toEqual({
      path: "user-1/chat/attachment-1.pdf",
    });
  });

  it("surfaces a storage upload error", async () => {
    const supabase = {
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Upload failed." },
          }),
        })),
      },
    };

    const file = new File(["hello"], "report.pdf", {
      type: "application/pdf",
    });

    await expect(
      uploadChatAttachment({
        supabase,
        userId: "user-1",
        file,
        fileId: "attachment-2",
      }),
    ).rejects.toThrow("Upload failed.");
  });
});
