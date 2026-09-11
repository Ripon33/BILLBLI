export const STORAGE_BUCKET = "user-files";

export const STORAGE_UPLOAD_OPTIONS = {
  upsert: false,
  cacheControl: "3600",
} as const;

export function getStorageBucket(): string {
  return STORAGE_BUCKET;
}

export function getStorageUploadOptions(): typeof STORAGE_UPLOAD_OPTIONS {
  return STORAGE_UPLOAD_OPTIONS;
}
