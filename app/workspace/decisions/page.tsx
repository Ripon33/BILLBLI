import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function DecisionsPage() {
  return (
    <WorkspaceDestination
      title="Decisions"
      description="Evaluate evidence, alternatives, trade-offs, and recommended actions."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Decision workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Review decision-oriented outputs before making a human decision.
        </p>
      </section>
    </WorkspaceDestination>
  );
}
