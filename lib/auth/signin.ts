type SignInResult = {
  data: {
    user: {
      id: string;
    } | null;
    session: {
      access_token: string;
    } | null;
  };
  error: Error | null;
};

type SignInWithPasswordFunction = (options: {
  email: string;
  password: string;
}) => Promise<SignInResult>;

type SignInWithEmailInput = {
  email: string;
  password: string;
  signInWithPassword: SignInWithPasswordFunction;
};

type OAuthResult = {
  data: {
    url: string | null;
  };
  error: Error | null;
};

type SignInWithOAuthFunction = (options: {
  provider: "google";
  options: {
    redirectTo: string;
  };
}) => Promise<OAuthResult>;

type SignInWithGoogleInput = {
  signInWithOAuth: SignInWithOAuthFunction;
};

type SetSessionPersistence = (persist: boolean) => Promise<void>;

export async function signInWithEmail({
  email,
  password,
  signInWithPassword,
}: SignInWithEmailInput) {
  const { data, error } = await signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithGoogle({
  signInWithOAuth,
}: SignInWithGoogleInput) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function applyRememberMe(
  rememberMe: boolean,
  setSessionPersistence: SetSessionPersistence,
) {
  await setSessionPersistence(rememberMe);
}

export async function signOutUser(
  signOut: () => Promise<{ error: Error | null }>,
) {
  const { error } = await signOut();

  if (error) {
    throw error;
  }
}
