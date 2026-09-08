import { StudyWorkspace } from "@/components/StudyWorkspace";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function StudyPage() {
  return (
    <WorkspaceDestination
      eyebrow="Structured learning"
      title="Understand deeply. Practice better."
      description="Turn research and important questions into structured understanding, examples, and practice."
    >
      <StudyWorkspace />
    </WorkspaceDestination>
  );
}
