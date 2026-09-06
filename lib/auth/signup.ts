type SignUpResult = {
  data: {
    user: {
      id: string;
      email?: string;
    } | null;
  };
  error: Error | null;
};

type SignUpFunction = (options: {
  email: string;
  password: string;
  options: {
    data: {
      full_name: string;
    };
    emailRedirectTo: string;
  };
}) => Promise<SignUpResult>;

type SignUpWithEmailInput = {
  email: string;
  password: string;
  fullName: string;
  signUp: SignUpFunction;
};

export async function signUpWithEmail({
  email,
  password,
  fullName,
  signUp,
}: SignUpWithEmailInput) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
