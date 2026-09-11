import { createClient } from "@/lib/supabase/server";

type UpdateUserFunction = (attributes: {
  password: string;
}) => Promise<{
  data: {
    user: {
      id: string;
    } | null;
  };
  error: Error | null;
}>;

type UpdatePasswordInput = {
  password: string;
  updateUser?: UpdateUserFunction;
};

export async function updatePassword({
  password,
  updateUser,
}: UpdatePasswordInput) {
  const normalizedPassword = password.trim();

  if (!normalizedPassword) {
    throw new Error("Password is required");
  }

  if (normalizedPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  let authenticatedUpdateUser = updateUser;

  if (!authenticatedUpdateUser) {
    const supabase = await createClient();

    authenticatedUpdateUser = async (attributes) =>
      supabase.auth.updateUser(attributes);
  }

  const { data, error } = await authenticatedUpdateUser({
    password: normalizedPassword,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Password update failed");
  }

  return {
    id: data.user.id,
  };
}
