"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function validatePasswordChange(
  password: string,
  confirmation: string,
): {
  valid: boolean;
  error: string | null;
} {
  const normalizedPassword = password.trim();

  if (normalizedPassword.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
    };
  }

  if (normalizedPassword !== confirmation) {
    return {
      valid: false,
      error: "Passwords do not match",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

export function buildPasswordUpdateRequest(password: string): RequestInit {
  return {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: password.trim(),
    }),
  };
}

export default function AccountSettings() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSignOut() {
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      window.location.assign("/sign-in");
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Failed to sign out.",
      );
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Failed to delete account.",
        );
      }

      window.location.assign("/sign-in");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete account.",
      );
      setBusy(false);
    }
  }

  function cancelPasswordChange() {
    setChangingPassword(false);
    setPassword("");
    setPasswordConfirmation("");
    setPasswordMessage(null);
    setPasswordError(null);
  }

  async function handlePasswordChange() {
    setPasswordMessage(null);
    setPasswordError(null);

    const validation = validatePasswordChange(
      password,
      passwordConfirmation,
    );

    if (!validation.valid) {
      setPasswordError(validation.error);
      return;
    }

    setPasswordBusy(true);

    try {
      const response = await fetch(
        "/api/account/password",
        buildPasswordUpdateRequest(password),
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Failed to update password.",
        );
      }

      setPassword("");
      setPasswordConfirmation("");
      setChangingPassword(false);
      setPasswordMessage("Password updated successfully.");
    } catch (passwordUpdateError) {
      setPasswordError(
        passwordUpdateError instanceof Error
          ? passwordUpdateError.message
          : "Failed to update password.",
      );
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Account settings
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Manage your BILLBLI account security and authentication.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Password
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Change the password used to sign in to BILLBLI.
              </p>
            </div>

            {!changingPassword && (
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(true);
                  setPasswordMessage(null);
                  setPasswordError(null);
                }}
                className="min-h-10 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
              >
                Change Password
              </button>
            )}
          </div>

          {changingPassword && (
            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="settings-password"
                  className="text-sm font-medium text-zinc-800"
                >
                  New password
                </label>
                <input
                  id="settings-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={passwordBusy}
                  autoComplete="new-password"
                  className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50"
                />
              </div>

              <div>
                <label
                  htmlFor="settings-password-confirmation"
                  className="text-sm font-medium text-zinc-800"
                >
                  Confirm new password
                </label>
                <input
                  id="settings-password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  disabled={passwordBusy}
                  autoComplete="new-password"
                  className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50"
                />
              </div>

              <p className="text-xs text-zinc-500">
                Use at least 8 characters.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelPasswordChange}
                  disabled={passwordBusy}
                  className="min-h-10 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordBusy}
                  className="min-h-10 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordBusy ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>

        {passwordMessage && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800"
          >
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {passwordError}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Account actions
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Manage your current BILLBLI session or permanently remove your
            account.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="min-h-10 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working..." : "Sign out"}
          </button>

          {!confirming ? (
            <button
              type="button"
              onClick={() => {
                setConfirming(true);
                setError(null);
              }}
              disabled={busy}
              className="min-h-10 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete account
            </button>
          ) : (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Delete my account?
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                This action cannot be undone.
              </p>

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  className="min-h-10 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={busy}
                  className="min-h-10 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Deleting..." : "Yes, delete account"}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}
      </section>
    </div>
  );
}
