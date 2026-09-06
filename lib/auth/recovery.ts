type ResetPasswordFunction = (
  email: string,
  options: {
    redirectTo: string;
  },
) => Promise<{
  data: Record<string, unknown>;
  error: Error | null;
}>;

type RequestPasswordResetInput = {
  email: string;
  resetPasswordForEmail: ResetPasswordFunction;
};

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
  updateUser: UpdateUserFunction;
};

export async function requestPasswordReset({
  email,
  resetPasswordForEmail,
}: RequestPasswordResetInput) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback`,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePassword({
  password,
  updateUser,
}: UpdatePasswordInput) {
  const { data, error } = await updateUser({
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}
