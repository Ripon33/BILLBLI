import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <h1>BILLBLI</h1>
      <p>Research deeper. Decide better.</p>

      {user ? (
        <Link href="/workspace">Go to workspace</Link>
      ) : (
        <Link href="/sign-in">Sign in</Link>
      )}
    </main>
  );
}
