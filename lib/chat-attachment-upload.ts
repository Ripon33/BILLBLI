import { buildChatAttachmentPath } from "./storage-path";
import {
  getStorageBucket,
  getStorageUploadOptions,
} from "./storage-upload";
import {
  validateAttachment,
  type AttachmentValidationInput,
} from "./attachment-validation";

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: File,
        options: {
          upsert: boolean;
          cacheControl: string;
          contentType: string;
        },
      ) => Promise<{
        data: { path: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function uploadChatAttachment(input: {
  supabase: StorageClient;
  userId: string;
  file: File;
  fileId: string;
}): Promise<{ path: string }> {
  const metadata: AttachmentValidationInput = {
    name: input.file.name,
    type: input.file.type,
    size: input.file.size,
  };

  validateAttachment(metadata);

  const extension = input.file.name.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("Chat attachment must have a file extension.");
  }

  const path = buildChatAttachmentPath(
    input.userId,
    input.fileId,
    extension,
  );

  const { data, error } = await input.supabase.storage
    .from(getStorageBucket())
    .upload(path, input.file, {
      ...getStorageUploadOptions(),
      contentType: input.file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.path) {
    throw new Error("Chat attachment upload did not return a storage path.");
  }

  return {
    path: data.path,
  };
}
