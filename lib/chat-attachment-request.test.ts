import { describe, expect, it } from "vitest";
import {
  validateChatAttachmentRequest,
  type ChatAttachmentRequest,
} from "./chat-attachment-request";

describe("chat attachment request validation", () => {
  const attachment: ChatAttachmentRequest = {
    id: "attachment-1",
    name: "report.pdf",
    type: "application/pdf",
    size: 1024,
    storagePath: "user-1/chat/attachment-1.pdf",
  };

  it("accepts attachment metadata owned by the authenticated user", () => {
    expect(
      validateChatAttachmentRequest({
        userId: "user-1",
        attachments: [attachment],
      }),
    ).toEqual([attachment]);
  });

  it("rejects an attachment belonging to another user", () => {
    expect(() =>
      validateChatAttachmentRequest({
        userId: "user-1",
        attachments: [
          {
            ...attachment,
            storagePath: "user-2/chat/attachment-1.pdf",
          },
        ],
      }),
    ).toThrow("Invalid chat attachment storage path.");
  });

  it("rejects non-chat storage paths", () => {
    expect(() =>
      validateChatAttachmentRequest({
        userId: "user-1",
        attachments: [
          {
            ...attachment,
            storagePath: "user-1/profile/attachment-1.png",
          },
        ],
      }),
    ).toThrow("Invalid chat attachment storage path.");
  });

  it("rejects attachment paths containing traversal segments", () => {
    expect(() =>
      validateChatAttachmentRequest({
        userId: "user-1",
        attachments: [
          {
            ...attachment,
            storagePath: "user-1/chat/../user-2/attachment-1.pdf",
          },
        ],
      }),
    ).toThrow("Invalid chat attachment storage path.");
  });

  it("rejects an empty attachment list when attachments are supplied", () => {
    expect(() =>
      validateChatAttachmentRequest({
        userId: "user-1",
        attachments: [],
      }),
    ).toThrow("Chat attachments cannot be empty.");
  });
});
