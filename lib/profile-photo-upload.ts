import {
  getStorageUploadOptions,
  getStorageBucket,
} from "./storage-upload";
import { buildProfilePhotoPath } from "./storage-path";
import {
  validateProfilePhoto,
  type ProfilePhotoValidationInput,
} from "./profile-photo";

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

type UploadProfilePhotoInput = {
  supabase: StorageClient;
  userId: string;
  file: File;
  fileId: string;
};

function getExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("Profile photo must have a file extension.");
  }

  return extension;
}

export async function uploadProfilePhoto({
  supabase,
  userId,
  file,
  fileId,
}: UploadProfilePhotoInput): Promise<{ path: string }> {
  const metadata: ProfilePhotoValidationInput = {
    name: file.name,
    type: file.type,
    size: file.size,
  };

  validateProfilePhoto(metadata);

  const path = buildProfilePhotoPath(
    userId,
    fileId,
    getExtension(file.name),
  );

  const { data, error } = await supabase.storage
    .from(getStorageBucket())
    .upload(path, file, {
      ...getStorageUploadOptions(),
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.path) {
    throw new Error("Profile photo upload did not return a storage path.");
  }

  return { path: data.path };
}
