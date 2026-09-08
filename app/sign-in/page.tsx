"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  applyRememberMe,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth/signin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      await applyRememberMe(rememberMe, async () => {});

      await signInWithEmail({
        email,
        password,
        signInWithPassword: supabase.auth.signInWithPassword.bind(
          supabase.auth,
        ),
      });

      window.location.assign("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const data = await signInWithGoogle({
        signInWithOAuth: supabase.auth.signInWithOAuth.bind(supabase.auth),
      });

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("Unable to start Google sign-in");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in with Google",
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-950 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <Card className="w-full p-6 sm:p-8">
          <div className="mb-8">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-zinc-950"
            >
              BILLBLI
            </Link>

            <h1 className="mt-8 text-2xl font-semibold tracking-tight">
              Sign in to continue
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Continue your research, decisions, and work.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                label="Email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                label="Password"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              or
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border-zinc-300 bg-white text-zinc-800"
          >
            Sign in with Google
          </Button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-green-700 hover:text-green-800"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
