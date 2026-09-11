function normalizeExtension(extension: string): string {
  const normalized = extension.trim().replace(/^\.+/, "");

  if (!normalized || !/^[a-zA-Z0-9]+$/.test(normalized)) {
    throw new Error("Invalid file extension.");
  }

  return normalized.toLowerCase();
}

function buildUserFilePath(
  userId: string,
  folder: "profile" | "chat",
  fileId: string,
  extension: string,
): string {
  if (!userId || userId.includes("/") || userId.includes("\\")) {
    throw new Error("Invalid user id.");
  }

  if (!fileId || fileId.includes("/") || fileId.includes("\\")) {
    throw new Error("Invalid file id.");
  }

  return `${userId}/${folder}/${fileId}.${normalizeExtension(extension)}`;
}

export function buildProfilePhotoPath(
  userId: string,
  fileId: string,
  extension: string,
): string {
  return buildUserFilePath(userId, "profile", fileId, extension);
}

export function buildChatAttachmentPath(
  userId: string,
  fileId: string,
  extension: string,
): string {
  return buildUserFilePath(userId, "chat", fileId, extension);
}
