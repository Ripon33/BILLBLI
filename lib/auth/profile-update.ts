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
  };
}) => Promise<{
  data: {
    user: AuthUser | null;
  };
  error: Error | null;
}>;

type UpdateCurrentProfileInput = {
  fullName: string;
  getUser?: GetUserFunction;
  updateUser?: UpdateUserFunction;
};

export async function updateCurrentProfile({
  fullName,
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

  const { data, error } = await authenticatedUpdateUser({
    data: {
      full_name: normalizedFullName,
    },
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
  };
}
