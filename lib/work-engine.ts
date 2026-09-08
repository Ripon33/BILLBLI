import { classifyIntent } from "./intent-engine";
import { classifyHumanDecisionRequirement, type WorkDecisionEvaluation } from "./work-decision";

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

export type WorkAutonomy = "auto" | "review" | "approval" | "restricted";

export type WorkAuthorization =
  | "not_required"
  | "required"
  | "authorized";

export type BillbliWork = {
  id: string;
  title: string;
  goal: string;
  status: WorkStatus;
  priority: WorkPriority;
  autonomy: WorkAutonomy;
  authorization: WorkAuthorization;
  workerType?: import("./worker-domain").WorkerType;
  workerName?: string;
  workerContext?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkInput = {
  title: string;
  goal: string;
  autonomy?: WorkAutonomy;
  workerType?: import("./worker-domain").WorkerType;
  workerName?: string;
  workerContext?: Record<string, unknown>;
};

export function createWork(input: CreateWorkInput): BillbliWork {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: input.title,
    goal: input.goal,
    status: "draft",
    priority: "normal",
    autonomy: input.autonomy ?? "auto",
    authorization:
      (input.autonomy ?? "auto") === "approval" ||
      (input.autonomy ?? "auto") === "restricted"
        ? "required"
        : "not_required",
    workerType: input.workerType,
    workerName: input.workerName,
    workerContext: input.workerContext,
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

export type WorkPermission = {
  allowed: boolean;
  requiresHumanDecision: boolean;
  requiresAuthorization: boolean;
};

const humanDecisionKeywords = [
  "terminate employee",
  "fire employee",
  "dismiss employee",
  "medical decision",
  "legal decision",
];

export function getWorkPermission(work: BillbliWork): WorkPermission {
  const requiresHumanDecision = humanDecisionKeywords.some((keyword) =>
    `${work.title} ${work.goal}`.toLowerCase().includes(keyword),
  );

  if (requiresHumanDecision) {
    return {
      allowed: false,
      requiresHumanDecision: true,
      requiresAuthorization: true,
    };
  }

  if (work.autonomy === "approval" || work.autonomy === "restricted") {
    return {
      allowed: false,
      requiresHumanDecision: false,
      requiresAuthorization: true,
    };
  }

  if (work.autonomy === "review") {
    return {
      allowed: false,
      requiresHumanDecision: false,
      requiresAuthorization: false,
    };
  }

  return {
    allowed: true,
    requiresHumanDecision: false,
    requiresAuthorization: false,
  };
}

export type AuthorizedWork = BillbliWork & {
  authorization: WorkAuthorization;
};

export function authorizeWork(work: BillbliWork): AuthorizedWork {
  if (work.autonomy !== "approval" && work.autonomy !== "restricted") {
    throw new Error("Work does not require authorization");
  }

  const now = new Date().toISOString();
  const updatedAt =
    now === work.updatedAt
      ? new Date(Date.parse(work.updatedAt) + 1).toISOString()
      : now;

  return {
    ...work,
    authorization: "authorized",
    updatedAt,
  };
}

export type WorkTaskStatus =
  | "ready"
  | "running"
  | "waiting_input"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type BillbliWorkTask = {
  id: string;
  title: string;
  domain: string;
  status: WorkTaskStatus;
  dependsOn: string[];
};

export type CreateWorkTaskInput = {
  title: string;
  status?: WorkTaskStatus;
  dependsOn?: string[];
};

export function createWorkTask(
  input: CreateWorkTaskInput,
): BillbliWorkTask {
  const classification = classifyIntent(input.title);

  return {
    id: crypto.randomUUID(),
    title: input.title,
    domain: classification.primaryMode,
    status: input.status ?? "ready",
    dependsOn: input.dependsOn ?? [],
  };
}

export type TaskDependencyValidation = {
  valid: true;
  executable: boolean;
};

export function validateTaskDependencies(
  task: BillbliWorkTask,
  allTasks: BillbliWorkTask[],
): TaskDependencyValidation {
  if (task.dependsOn.includes(task.id)) {
    throw new Error("Task cannot depend on itself");
  }

  const taskMap = new Map(allTasks.map((candidate) => [candidate.id, candidate]));

  function reachesTarget(
    currentId: string,
    targetId: string,
    visited: Set<string>,
  ): boolean {
    if (currentId === targetId) {
      return true;
    }

    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);

    const current = taskMap.get(currentId);
    if (!current) {
      return false;
    }

    return current.dependsOn.some((dependencyId) =>
      reachesTarget(dependencyId, targetId, visited),
    );
  }

  for (const dependencyId of task.dependsOn) {
    const dependency = taskMap.get(dependencyId);

    if (!dependency) {
      throw new Error(`Unknown task dependency: ${dependencyId}`);
    }

    if (
      dependency.dependsOn.includes(task.id) ||
      reachesTarget(dependency.id, task.id, new Set())
    ) {
      throw new Error("Circular task dependency");
    }

    if (dependency.status !== "completed") {
      return {
        valid: true,
        executable: false,
      };
    }
  }

  return {
    valid: true,
    executable: true,
  };
}

const validWorkTaskTransitions: Record<
  WorkTaskStatus,
  WorkTaskStatus[]
> = {
  ready: ["running", "cancelled"],
  running: [
    "waiting_input",
    "waiting_approval",
    "completed",
    "failed",
  ],
  waiting_input: ["ready", "cancelled"],
  waiting_approval: ["ready", "running", "cancelled"],
  completed: [],
  failed: ["ready", "cancelled"],
  cancelled: [],
};

export function transitionWorkTask(
  task: BillbliWorkTask,
  nextStatus: WorkTaskStatus,
): BillbliWorkTask {
  if (!validWorkTaskTransitions[task.status].includes(nextStatus)) {
    throw new Error("Invalid task transition");
  }

  return {
    ...task,
    status: nextStatus,
  };
}


export function evaluateWorkDecision(
  work: BillbliWork,
): WorkDecisionEvaluation {
  const humanDecision = classifyHumanDecisionRequirement(
    work.title,
    work.goal,
  );

  if (humanDecision.required) {
    return {
      classification: "human_decision_required",
      authorization: "human_decision_required",
      requiresHumanDecision: true,
      requiresAuthorization: true,
      canExecute: false,
      reason: humanDecision.reason,
    };
  }

  if (work.autonomy === "approval") {
    const authorized = work.authorization === "authorized";

    return {
      classification: "authorization_required",
      authorization: authorized ? "authorized" : "pending_approval",
      requiresHumanDecision: false,
      requiresAuthorization: true,
      canExecute: authorized,
      reason: authorized
        ? "Work is explicitly authorized."
        : "Explicit authorization is required before execution.",
    };
  }

  if (work.autonomy === "restricted") {
    return {
      classification: "authorization_required",
      authorization:
        work.authorization === "authorized"
          ? "authorized"
          : "pending_approval",
      requiresHumanDecision: false,
      requiresAuthorization: true,
      canExecute: false,
      reason: "Restricted work cannot execute through ordinary authorization.",
    };
  }

  if (work.autonomy === "review") {
    return {
      classification: "proceed",
      authorization: "not_required",
      requiresHumanDecision: false,
      requiresAuthorization: false,
      canExecute: false,
      reason: "Work requires review before execution.",
    };
  }

  return {
    classification: "proceed",
    authorization: "not_required",
    requiresHumanDecision: false,
    requiresAuthorization: false,
    canExecute: true,
    reason: "Work is permitted to execute.",
  };
}
