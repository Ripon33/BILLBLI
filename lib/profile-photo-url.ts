import { getStorageBucket } from "./storage-upload";

const PROFILE_PHOTO_URL_TTL = 3600;

type StorageClient = {
  storage: {
    from: (
      bucket: string,
    ) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{
        data: { signedUrl: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function getProfilePhotoUrl({
  supabase,
  avatarPath,
}: {
  supabase: StorageClient;
  avatarPath?: string;
}): Promise<string | null> {
  if (!avatarPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(getStorageBucket())
    .createSignedUrl(avatarPath, PROFILE_PHOTO_URL_TTL);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.signedUrl) {
    throw new Error("Profile photo URL was not returned.");
  }

  return data.signedUrl;
}
