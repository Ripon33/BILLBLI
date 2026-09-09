"use client";

type ProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type ProfileViewModel = {
  userId: string;
  email: string;
  fullName: string;
};

export function createProfileViewModel(
  user: ProfileUser,
): ProfileViewModel {
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : "BILLBLI User";

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName,
  };
}

export default function ProfileWorkspace({
  user,
}: {
  user: ProfileUser;
}) {
  const profile = createProfileViewModel(user);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700"
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {profile.email}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">
          Account information
        </h2>

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
      </section>

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
