import TaskWorkspace from "@/components/TaskWorkspace";
import WorkCreationPanel from "@/components/WorkCreationPanel";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function TasksPage() {
  return (
    <WorkspaceDestination
      title="Tasks"
      description="Create and review structured tasks, then plan authorized work through the BILLBLI Work Engine."
    >
      <div className="space-y-6">
        <TaskWorkspace />

        <WorkCreationPanel />

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Governed execution
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Task creation does not execute external actions automatically.
            Input, approval, authorization, ownership, and Work Engine rules
            remain enforced by their existing systems.
          </p>
        </section>
      </div>
    </WorkspaceDestination>
  );
}
