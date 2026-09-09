import HistoryWorkspace from "@/components/HistoryWorkspace";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function HistoryPage() {
  return (
    <WorkspaceDestination
      title="History"
      description="Review your previous research and study activity."
    >
      <HistoryWorkspace />
    </WorkspaceDestination>
  );
}
