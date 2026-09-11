import { createClient } from "@/lib/supabase/server";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type GetUserFunction = () => Promise<{
  data: {
    user: AuthUser | null;
  };
  error: Error | null;
}>;

type UpdateUserFunction = (attributes: {
  data: {
    full_name: string;
    avatar_path?: string;
  };
}) => Promise<{
  data: {
    user: AuthUser | null;
  };
  error: Error | null;
}>;

type UpdateCurrentProfileInput = {
  fullName: string;
  avatarPath?: string;
  getUser?: GetUserFunction;
  updateUser?: UpdateUserFunction;
};

export async function updateCurrentProfile({
  fullName,
  avatarPath,
  getUser,
  updateUser,
}: UpdateCurrentProfileInput) {
  const normalizedFullName = fullName.trim();

  if (!normalizedFullName) {
    throw new Error("Full name is required");
  }

  let authenticatedGetUser = getUser;
  let authenticatedUpdateUser = updateUser;

  if (!authenticatedGetUser || !authenticatedUpdateUser) {
    const supabase = await createClient();

    authenticatedGetUser ??= async () => supabase.auth.getUser();
    authenticatedUpdateUser ??= async (attributes) =>
      supabase.auth.updateUser(attributes);
  }

  const {
    data: { user },
    error: getUserError,
  } = await authenticatedGetUser();

  if (getUserError || !user) {
    throw new Error("Authenticated user is required");
  }

    if (avatarPath !== undefined) {
      const parts = avatarPath.split("/");

      const isValidAvatarPath =
        parts.length === 3 &&
        parts[0] === user.id &&
        parts[1] === "profile" &&
        /^[A-Za-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(parts[2]);

      if (!isValidAvatarPath) {
        throw new Error("Invalid avatar path.");
      }
    }

  const metadata: { full_name: string; avatar_path?: string } = {
    full_name: normalizedFullName,
  };

  if (avatarPath !== undefined) {
    metadata.avatar_path = avatarPath;
  }

  const { data, error } = await authenticatedUpdateUser({
    data: metadata,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Profile update failed");
  }

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName:
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name
        : normalizedFullName,
    ...(typeof data.user.user_metadata?.avatar_path === "string"
      ? { avatarPath: data.user.user_metadata.avatar_path }
      : {}),
  };
}
