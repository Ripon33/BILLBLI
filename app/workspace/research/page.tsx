import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function ResearchPage() {
  return (
    <WorkspaceDestination
      title="Research"
      description="Investigate questions with evidence-first research and structured findings."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Research workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Start a research question from the BILLBLI workspace.
        </p>
      </section>
    </WorkspaceDestination>
  );
}
