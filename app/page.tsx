import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-zinc-950"
          >
            BILLBLI
          </Link>

          <Link
            href={user ? "/workspace" : "/sign-in"}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            {user ? "Go to workspace" : "Sign in"}
          </Link>
        </header>

        <section className="flex flex-1 items-center py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
              Decision Intelligence
            </p>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Research deeper. Decide better.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
              BILLBLI helps you turn research into clear decisions, human
              authorization, and accountable work.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={user ? "/workspace" : "/sign-in"}
                className="billbli-button inline-flex items-center justify-center no-underline"
              >
                {user ? "Go to workspace" : "Get started"}
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-200 pt-5 text-sm text-zinc-500">
          Research · Decisions · Work
        </footer>
      </div>
    </main>
  );
}
