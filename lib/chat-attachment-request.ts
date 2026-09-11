import type { ChatAttachment } from "./chat-attachment";

export type ChatAttachmentRequest = ChatAttachment;

const CHAT_ATTACHMENT_PATH_PATTERN =
  /^([^/\\]+)\/chat\/([^/\\]+)\.(jpg|jpeg|png|webp|pdf|txt|csv|json)$/i;

export function validateChatAttachmentRequest(input: {
  userId: string;
  attachments?: ChatAttachmentRequest[];
}): ChatAttachmentRequest[] {
  if (input.attachments === undefined) {
    return [];
  }

  if (input.attachments.length === 0) {
    throw new Error("Chat attachments cannot be empty.");
  }

  return input.attachments.map((attachment) => {
    const match = attachment.storagePath.match(CHAT_ATTACHMENT_PATH_PATTERN);

    if (!match || match[1] !== input.userId) {
      throw new Error("Invalid chat attachment storage path.");
    }

    if (
      !attachment.id.trim() ||
      !attachment.name.trim() ||
      !attachment.type.trim() ||
      attachment.size <= 0
    ) {
      throw new Error("Invalid chat attachment metadata.");
    }

    return {
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      storagePath: attachment.storagePath,
    };
  });
}
