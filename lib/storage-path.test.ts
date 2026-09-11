import { describe, expect, it } from "vitest";
import {
  buildProfilePhotoPath,
  buildChatAttachmentPath,
} from "./storage-path";

describe("storage paths", () => {
  it("keeps profile photos inside the authenticated user's profile folder", () => {
    expect(
      buildProfilePhotoPath("user-123", "photo-id", "png"),
    ).toBe("user-123/profile/photo-id.png");
  });

  it("keeps chat attachments inside the authenticated user's chat folder", () => {
    expect(
      buildChatAttachmentPath("user-123", "attachment-id", "pdf"),
    ).toBe("user-123/chat/attachment-id.pdf");
  });

  it("normalizes extensions without allowing path separators", () => {
    expect(
      buildProfilePhotoPath("user-123", "photo-id", ".webp"),
    ).toBe("user-123/profile/photo-id.webp");
  });
});
