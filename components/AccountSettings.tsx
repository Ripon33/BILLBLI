"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountSettings() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      window.location.assign("/sign-in");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign out. Please try again.",
      );
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let message = "Unable to delete your account. Please try again.";

        try {
          const body = await response.json();

          if (typeof body?.error === "string") {
            message = body.error;
          }
        } catch {
          // Keep the fallback message when the response is not JSON.
        }

        throw new Error(message);
      }

      window.location.assign("/sign-in");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete your account. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="account-settings-title">
      <h2 id="account-settings-title">Account settings</h2>

      <div>
        <h3>Sign out</h3>
        <p>Sign out of your BILLBLI account on this device.</p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={busy}
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <div>
        <h3>Delete account</h3>
        <p>
          Delete your BILLBLI account and associated user-owned data. This is
          permanent.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setConfirming(true);
            }}
            disabled={busy}
          >
            Delete account
          </button>
        ) : (
          <div role="alertdialog" aria-label="Confirm account deletion">
            <p>This action cannot be undone.</p>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        )}
      </div>

      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
