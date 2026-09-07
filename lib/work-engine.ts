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
