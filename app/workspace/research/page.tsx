import { ResearchWorkspace } from "@/components/ResearchWorkspace";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function ResearchPage() {
  return (
    <WorkspaceDestination
      eyebrow="Evidence-first research"
      title="Research deeper. Decide better."
      description="Investigate important questions with evidence-first research, competing signals, and structured findings."
    >
      <ResearchWorkspace />
    </WorkspaceDestination>
  );
}
