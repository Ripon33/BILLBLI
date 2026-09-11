"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { validateProfilePhoto } from "@/lib/profile-photo";
import { uploadProfilePhoto } from "@/lib/profile-photo-upload";
import { getProfilePhotoUrl } from "@/lib/profile-photo-url";
import { createClient } from "@/lib/supabase/client";

type ProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type ProfileViewModel = {
  userId: string;
  email: string;
  fullName: string;
  avatarPath?: string;
};

export function normalizeProfileName(fullName: string): string {
  const normalized = fullName.trim();

  if (!normalized) {
    throw new Error("Full name is required");
  }

  return normalized;
}

export function buildProfileUpdateRequest(
  fullName: string,
  avatarPath?: string,
): RequestInit {
  const normalized = normalizeProfileName(fullName);

  return {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: normalized,
      ...(avatarPath !== undefined ? { avatarPath } : {}),
    }),
  };
}

export function readProfileUpdateResponse(response: {
  profile: {
    id: string;
    email: string;
    fullName: string;
    avatarPath?: string;
  };
}) {
  return response.profile;
}

export function createProfileViewModel(user: ProfileUser): ProfileViewModel {
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : "BILLBLI User";

  const avatarPath =
    typeof user.user_metadata?.avatar_path === "string" &&
    user.user_metadata.avatar_path.trim()
      ? user.user_metadata.avatar_path.trim()
      : undefined;

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName,
    avatarPath,
  };
}

export default function ProfileWorkspace({
  user,
}: {
  user: ProfileUser;
}) {
  const initialProfile = createProfileViewModel(user);

  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      if (!profile.avatarPath) {
        setAvatarUrl(null);
        return;
      }

      try {
        const supabase = createClient();
        const signedUrl = await getProfilePhotoUrl({
          supabase,
          avatarPath: profile.avatarPath,
        });

        if (!cancelled) {
          setAvatarUrl(signedUrl);
        }
      } catch {
        if (!cancelled) {
          setAvatarUrl(null);
        }
      }
    }

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [profile.avatarPath]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedPhoto]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;

    setError(null);

    if (!file) {
      setSelectedPhoto(null);
      return;
    }

    try {
      validateProfilePhoto({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setSelectedPhoto(file);
    } catch (photoError) {
      setSelectedPhoto(null);
      setError(
        photoError instanceof Error
          ? photoError.message
          : "Please select a valid profile photo.",
      );
      event.currentTarget.value = "";
    }
  }

  function startEditing() {
    setFullName(profile.fullName);
    setSelectedPhoto(null);
    setMessage(null);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setFullName(profile.fullName);
    setMessage(null);
    setError(null);
    setEditing(false);
  }

  async function saveProfile() {
    setMessage(null);
    setError(null);
    setSaving(true);

    try {
      let avatarPath: string | undefined;

      if (selectedPhoto) {
        const supabase = createClient();

        const uploadedPhoto = await uploadProfilePhoto({
          supabase,
          userId: profile.userId,
          file: selectedPhoto,
          fileId: crypto.randomUUID(),
        });

        avatarPath = uploadedPhoto.path;
      }

      const request = buildProfileUpdateRequest(fullName, avatarPath);

      const response = await fetch("/api/profile", request);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Failed to update profile.",
        );
      }

      const updatedProfile = readProfileUpdateResponse(body);

      setProfile({
        userId: updatedProfile.id,
        email: updatedProfile.email,
        fullName: updatedProfile.fullName,
        ...(updatedProfile.avatarPath
          ? { avatarPath: updatedProfile.avatarPath }
          : {}),
      });

      setFullName(updatedProfile.fullName);
      setEditing(false);
      setSelectedPhoto(null);
      setPhotoPreviewUrl(null);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-zinc-900">
                {profile.fullName}
              </h2>
              <p className="mt-1 break-all text-sm text-zinc-500">
                {profile.email || "Email not available"}
              </p>
            </div>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Account information
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manage the information shown on your BILLBLI profile.
            </p>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="profile-photo"
                className="text-sm font-medium text-zinc-800"
              >
                Profile photo
              </label>

              <input
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                onChange={handlePhotoChange}
                className="mt-2 block w-full text-sm text-zinc-700"
              />

              {photoPreviewUrl && (
                <img
                  src={photoPreviewUrl}
                  alt="Profile preview"
                  className="mt-3 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>

            <div>
              <label
                htmlFor="profile-full-name"
                className="text-sm font-medium text-zinc-800"
              >
                Full name
              </label>

              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={saving}
                autoComplete="name"
                className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50"
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Email
              </p>
              <p className="mt-1 break-all text-sm text-zinc-700">
                {profile.email || "Not available"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Email changes are not available from this profile editor.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="min-h-10 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="min-h-10 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-zinc-800">
                {profile.fullName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 break-all text-sm text-zinc-800">
                {profile.email || "Not available"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Account ID
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-zinc-600">
                {profile.userId}
              </dd>
            </div>
          </dl>
        )}
      </section>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-900">
          Account security
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Your profile is connected to your authenticated BILLBLI account.
          Account actions such as sign-out and account deletion remain
          available in Settings.
        </p>
      </section>
    </div>
  );
}
