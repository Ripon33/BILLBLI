import { evaluateWorkExecutionGate, type WorkDecisionEvaluation } from "./work-decision";
export type ExecutionStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "blocked";

export type WorkExecution = {
  id: string;
  taskId: string;
  status: ExecutionStatus;
};

export type CreateExecutionInput = {
  taskId: string;
  decision: WorkDecisionEvaluation;
};

export function createExecution(
  input: CreateExecutionInput,
): WorkExecution {
  if (!evaluateWorkExecutionGate(input.decision).allowed) {
    return {
      id: crypto.randomUUID(),
      taskId: input.taskId,
      status: "blocked",
    };
  }

  return {
    id: crypto.randomUUID(),
    taskId: input.taskId,
    status: "queued",
  };
}

export type TaskResultStatus = "succeeded" | "failed";

export type WorkTaskResult = {
  id: string;
  taskId: string;
  executionId: string;
  output: string;
  status: TaskResultStatus;
  verificationStatus: VerificationStatus;
};

export type CreateTaskResultInput = {
  taskId: string;
  executionId: string;
  output: string;
};

export function createTaskResult(
  input: CreateTaskResultInput,
): WorkTaskResult {
  return {
    id: crypto.randomUUID(),
    taskId: input.taskId,
    executionId: input.executionId,
    output: input.output,
    status: "succeeded",
    verificationStatus: "unverified",
  };
}

export type VerificationStatus =
  | "unverified"
  | "verified"
  | "verification_failed";

export function setVerificationStatus(
  result: WorkTaskResult,
  verificationStatus: VerificationStatus,
): WorkTaskResult & {
  verificationStatus: VerificationStatus;
} {
  return {
    ...result,
    verificationStatus,
  };
}
