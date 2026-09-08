import type { WorkStatus as WorkStatusValue } from "@/lib/work-engine";

const statusLabels: Record<WorkStatusValue, string> = {
  draft: "Draft",
  ready: "Ready",
  running: "Running",
  waiting_input: "Waiting for input",
  waiting_approval: "Waiting approval",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

type WorkStatusProps = {
  status: WorkStatusValue;
};

export function WorkStatus({ status }: WorkStatusProps) {
  return (
    <span
      role="status"
      aria-label={`Work status: ${statusLabels[status]}`}
      className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
    >
      {statusLabels[status]}
    </span>
  );
}
