export type WorkStatus =
  | "draft"
  | "ready"
  | "running"
  | "waiting_input"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type WorkPriority = "low" | "normal" | "high" | "urgent";

export type BillbliWork = {
  id: string;
  title: string;
  goal: string;
  status: WorkStatus;
  priority: WorkPriority;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkInput = {
  title: string;
  goal: string;
};

export function createWork(input: CreateWorkInput): BillbliWork {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: input.title,
    goal: input.goal,
    status: "draft",
    priority: "normal",
    createdAt: now,
    updatedAt: now,
  };
}

const validWorkTransitions: Record<WorkStatus, WorkStatus[]> = {
  draft: ["ready"],
  ready: ["running", "cancelled"],
  running: ["waiting_input", "waiting_approval", "completed", "failed"],
  waiting_input: ["ready", "cancelled"],
  waiting_approval: ["ready", "running", "cancelled"],
  completed: [],
  failed: ["ready", "cancelled"],
  cancelled: [],
};

export function transitionWork(
  work: BillbliWork,
  nextStatus: WorkStatus,
): BillbliWork {
  if (!validWorkTransitions[work.status].includes(nextStatus)) {
    throw new Error("Invalid work transition");
  }

  const now = new Date().toISOString();
  const updatedAt =
    now === work.updatedAt
      ? new Date(Date.parse(work.updatedAt) + 1).toISOString()
      : now;

  return {
    ...work,
    status: nextStatus,
    updatedAt,
  };
}
