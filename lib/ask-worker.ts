import { classifyIntent } from "./intent-engine";
import { getAnswerRoute } from "./answer-routing";
import type { WorkerType } from "./worker-domain";

export type AskWorkerRoute = "study" | "research" | "task";

export type AskWorkerRequest = {
  workerId: string;
  workerName: string;
  workerType?: WorkerType;
  workerGoal: string;
  message: string;
};

export type AskWorkerWorkProposal = {
  type: "work_proposal";
  title: string;
  goal: string;
  autonomy: "auto" | "review" | "approval" | "restricted";
};

export function buildAskWorkerRequest(input: {
  workerId: string;
  workerName: string;
  workerType?: WorkerType;
  workerGoal: string;
  message: string;
}): AskWorkerRequest {
  const message = input.message.trim();

  if (!message) {
    throw new Error("Ask Worker message is required.");
  }

  return {
    workerId: input.workerId,
    workerName: input.workerName,
    workerType: input.workerType,
    workerGoal: input.workerGoal,
    message,
  };
}

export function classifyAskWorkerRoute(message: string): AskWorkerRoute {
  const classification = classifyIntent(message);
  return getAnswerRoute(message, classification);
}
