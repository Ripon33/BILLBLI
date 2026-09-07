"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  applyRememberMe,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth/signin";

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
    <main>
      <h1>BILLBLI</h1>
      <p>Sign in to continue</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          Remember me
        </label>

        {error ? <p role="alert">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleSignIn} disabled={loading}>
        Sign in with Google
      </button>

      <p>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>

      <p>
        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
      </p>
    </main>
  );
}
