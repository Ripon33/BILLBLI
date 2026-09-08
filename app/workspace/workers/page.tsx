import WorkerWorkforce from "@/components/WorkerWorkforce";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function WorkersPage() {
  return (
    <WorkspaceDestination
      eyebrow="AI Workforce"
      title="Persistent AI workers"
      description="Create specialized AI workers that help you perform ongoing professional work under explicit human control."
    >
      <div className="space-y-6">
        <WorkerWorkforce />

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Governance
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Human-controlled work
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Workers remain governed by BILLBLI ownership, permission,
            authorization, and lifecycle controls.
          </p>
        </section>
      </div>
    </WorkspaceDestination>
  );
}
