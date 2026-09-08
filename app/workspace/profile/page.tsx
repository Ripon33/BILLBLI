import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function ProfilePage() {
  return (
    <WorkspaceDestination
      title="Profile"
      description="View your authenticated BILLBLI account profile."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Profile
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your authenticated profile information belongs to your BILLBLI
          account.
        </p>
      </section>
    </WorkspaceDestination>
  );
}
