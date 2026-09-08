import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function StudyPage() {
  return (
    <WorkspaceDestination
      title="Study"
      description="Turn research into structured understanding, evidence, and learning."
    >
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Study workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Review and develop knowledge from your research.
        </p>
      </section>
    </WorkspaceDestination>
  );
}
