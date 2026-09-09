import {
  buildAskWorkerRequest,
  classifyAskWorkerRoute,
  type AskWorkerRequest,
  type AskWorkerRoute,
} from "./ask-worker";
import { classifyHumanDecisionRequirement } from "./work-decision";
import {
  runResearch,
  type ResearchRunnerDependencies,
  type ResearchRunnerResult,
} from "./research-runner";

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
  research?: ResearchRunnerResult;
  workProposal?: AskWorkerRequest["workProposal"];
};

export type AskWorkerOrchestrationDependencies = {
  research?: ResearchRunnerDependencies;
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

export async function orchestrateAskWorker(
  input: AskWorkerRequest,
  dependencies: AskWorkerOrchestrationDependencies = {},
): Promise<AskWorkerOrchestrationResult> {
  const request = buildAskWorkerRequest(input);
  const route = classifyAskWorkerRoute(request.message);
  const humanDecisionRequired = classifyHumanDecisionRequirement(
    request.workerName,
    `${request.workerGoal} ${request.message}`,
  ).required;

  const research =
    route === "research"
      ? await runResearch(request.message, dependencies.research)
      : undefined;

  return {
    route,
    stages: stagesForRoute(route),
    ...(research !== undefined ? { research } : {}),
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
    ...(request.workProposal !== undefined
      ? { workProposal: request.workProposal }
      : {}),
  };
}
