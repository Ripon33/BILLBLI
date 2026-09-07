import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { handleAuthCallback } from "@/lib/auth/callback";

type AuthCallbackPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const { code } = await searchParams;
  const supabase = await createClient();

  const destination = await handleAuthCallback({
    code: code ?? null,
    exchangeCodeForSession: supabase.auth.exchangeCodeForSession.bind(
      supabase.auth,
    ),
  });

  redirect(destination);

  return null;
}
