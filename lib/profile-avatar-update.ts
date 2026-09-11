type AuthClient = {
  auth: {
    updateUser: (attributes: {
      data: {
        avatar_path: string;
      };
    }) => Promise<{
      data: {
        user: {
          id: string;
          user_metadata: Record<string, unknown>;
        } | null;
      };
      error: { message: string } | null;
    }>;
  };
};

type UpdateProfileAvatarPathInput = {
  supabase: AuthClient;
  avatarPath: string;
};

export async function updateProfileAvatarPath({
  supabase,
  avatarPath,
}: UpdateProfileAvatarPathInput): Promise<{ avatarPath: string }> {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      avatar_path: avatarPath,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Profile avatar update did not return a user.");
  }

  return {
    avatarPath,
  };
}
