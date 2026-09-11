export type ChatAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  storagePath: string;
};

export function buildChatAttachment(input: {
  file: File;
  attachmentId: string;
  storagePath: string;
}): ChatAttachment {
  if (!input.attachmentId.trim()) {
    throw new Error("Chat attachment id is required.");
  }

  if (!input.storagePath.trim()) {
    throw new Error("Chat attachment storage path is required.");
  }

  return {
    id: input.attachmentId,
    name: input.file.name,
    type: input.file.type,
    size: input.file.size,
    storagePath: input.storagePath,
  };
}
