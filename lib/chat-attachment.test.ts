import { describe, expect, it } from "vitest";
import {
  buildChatAttachment,
  type ChatAttachment,
} from "./chat-attachment";

describe("chat attachments", () => {
  it("builds a safe attachment record for a selected file", () => {
    const file = new File(["hello"], "report.pdf", {
      type: "application/pdf",
    });

    const result = buildChatAttachment({
      file,
      attachmentId: "attachment-1",
      storagePath: "user-1/chat/attachment-1.pdf",
    });

    expect(result).toEqual({
      id: "attachment-1",
      name: "report.pdf",
      type: "application/pdf",
      size: file.size,
      storagePath: "user-1/chat/attachment-1.pdf",
    });
  });

  it("does not expose the browser File object in the attachment record", () => {
    const file = new File(["hello"], "notes.txt", {
      type: "text/plain",
    });

    const result = buildChatAttachment({
      file,
      attachmentId: "attachment-2",
      storagePath: "user-1/chat/attachment-2.txt",
    });

    expect(result).not.toHaveProperty("file");
    expect(result).not.toHaveProperty("content");
  });
});
