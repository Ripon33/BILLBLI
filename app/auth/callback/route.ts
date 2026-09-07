import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleAuthCallback } from "@/lib/auth/callback";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createClient();

  const destination = await handleAuthCallback({
    code,
    exchangeCodeForSession: supabase.auth.exchangeCodeForSession.bind(
      supabase.auth,
    ),
  });

  return NextResponse.redirect(new URL(destination, origin));
}
