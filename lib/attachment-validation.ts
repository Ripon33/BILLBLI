export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/json",
] as const;

export type AttachmentValidationInput = {
  name: string;
  type: string;
  size: number;
};

export function validateAttachment(
  input: AttachmentValidationInput,
): AttachmentValidationInput {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(
    input.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number],
  )) {
    throw new Error("File type is not supported.");
  }

  if (input.size > MAX_ATTACHMENT_SIZE) {
    throw new Error("File is too large.");
  }

  if (input.size <= 0) {
    throw new Error("File is empty.");
  }

  return input;
}
