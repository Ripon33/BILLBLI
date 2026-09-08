import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function HistoryPage() {
  return (
    <WorkspaceDestination
      title="History"
      description="Review your previous research and study activity."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Activity history
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your existing research and study history remains the source of
          persisted activity.
        </p>
      </section>
    </WorkspaceDestination>
  );
}
