import {
  buildAskWorkerRequest,
  classifyAskWorkerRoute,
  type AskWorkerRequest,
  type AskWorkerRoute,
} from "./ask-worker";
import { classifyHumanDecisionRequirement } from "./work-decision";

export type AskWorkerOrchestrationContext = Pick<
  AskWorkerRequest,
  "workerId" | "workerName" | "workerType" | "workerGoal"
>;

export type AskWorkerGovernance = {
  recommendationIsAuthorization: false;
  requiresHumanAuthorization: boolean;
  externalExecutionAllowed: false;
};

export type AskWorkerOrchestrationResult = {
  route: AskWorkerRoute;
  stages: string[];
  context: AskWorkerOrchestrationContext;
  governance: AskWorkerGovernance;
  workProposal?: never;
};

function stagesForRoute(route: AskWorkerRoute): string[] {
  switch (route) {
    case "study":
      return ["understanding", "routing", "study", "synthesis"];

    case "task":
      return ["understanding", "routing", "task", "synthesis"];

    case "research":
      return ["understanding", "routing", "research", "synthesis"];
  }
}

export function orchestrateAskWorker(
  input: AskWorkerRequest,
): AskWorkerOrchestrationResult {
  const request = buildAskWorkerRequest(input);
  const route = classifyAskWorkerRoute(request.message);
  const humanDecisionRequired = classifyHumanDecisionRequirement(
    request.workerName,
    `${request.workerGoal} ${request.message}`,
  ).required;

  return {
    route,
    stages: stagesForRoute(route),
    context: {
      workerId: request.workerId,
      workerName: request.workerName,
      ...(request.workerType !== undefined
        ? { workerType: request.workerType }
        : {}),
      workerGoal: request.workerGoal,
    },
    governance: {
      recommendationIsAuthorization: false,
      requiresHumanAuthorization: humanDecisionRequired,
      externalExecutionAllowed: false,
    },
  };
}
