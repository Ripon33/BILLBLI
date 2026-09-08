import WorkCreationPanel from "@/components/WorkCreationPanel";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function TasksPage() {
  return (
    <WorkspaceDestination
      title="Tasks"
      description="Plan and manage authorized work through the BILLBLI Work Engine."
    >
      <div className="space-y-6">
        <WorkCreationPanel />

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Work lifecycle
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Work execution remains governed by the existing lifecycle,
            authorization, ownership, and permission rules.
          </p>
        </section>
      </div>
    </WorkspaceDestination>
  );
}
