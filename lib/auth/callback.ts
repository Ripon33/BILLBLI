type ExchangeCodeForSession = (
  code: string,
) => Promise<{
  data: {
    session: {
      access_token: string;
    } | null;
  };
  error: Error | null;
}>;

type AuthCallbackInput = {
  code: string | null;
  exchangeCodeForSession: ExchangeCodeForSession;
};

export async function handleAuthCallback({
  code,
  exchangeCodeForSession,
}: AuthCallbackInput) {
  if (!code) {
    return "/sign-in";
  }

  const { data, error } = await exchangeCodeForSession(code);

  if (error || !data.session) {
    return "/sign-in";
  }

  return "/workspace";
}
