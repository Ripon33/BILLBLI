export type WorkDecisionClassification =
  | "proceed"
  | "human_decision_required"
  | "authorization_required"
  | "blocked";

export type WorkAuthorizationState =
  | "not_required"
  | "human_decision_required"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "authorized"
  | "blocked";

export type WorkDecisionEvaluation = {
  classification: WorkDecisionClassification;
  authorization: WorkAuthorizationState;
  requiresHumanDecision: boolean;
  requiresAuthorization: boolean;
  canExecute: boolean;
  reason: string;
};
export type HumanDecisionRequirement = {
  required: boolean;
  reason: string;
};

const humanDecisionBoundaryRules = [
  {
    reason: "Employment decisions require human judgment and authorization.",
    keywords: [
      "terminate employee",
      "fire employee",
      "dismiss employee",
      "hire employee",
      "reject candidate",
      "promote employee",
      "demote employee",
    ],
  },
  {
    reason: "Significant financial decisions require human judgment and authorization.",
    keywords: [
      "major payment",
      "significant financial",
      "financial transaction",
      "approve payment",
      "transfer money",
      "send money",
    ],
  },
  {
    reason: "Legal or compliance decisions require human judgment and authorization.",
    keywords: [
      "legal decision",
      "legal action",
      "legal compliance",
      "compliance decision",
      "regulatory action",
    ],
  },
  {
    reason: "Medical or safety decisions require human judgment and authorization.",
    keywords: [
      "medical decision",
      "medical treatment",
      "choose a treatment",
      "safety decision",
      "safety action",
    ],
  },
  {
    reason: "Destructive or irreversible actions require human judgment and authorization.",
    keywords: [
      "delete production data",
      "permanently destroy",
      "destroy the production",
      "irreversible action",
      "permanently delete",
    ],
  },
];

export function classifyHumanDecisionRequirement(
  title: string,
  goal: string,
): HumanDecisionRequirement {
  const text = `${title} ${goal}`.toLowerCase();

  const matchedRule = humanDecisionBoundaryRules.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword)),
  );

  if (matchedRule) {
    return {
      required: true,
      reason: matchedRule.reason,
    };
  }

  return {
    required: false,
    reason: "No human decision is required for this ordinary task.",
  };
}
export type AuthorizationTransition =
  | "approve"
  | "reject"
  | "authorize";

export function transitionAuthorizationState(
  currentState: WorkAuthorizationState,
  transition: AuthorizationTransition,
): WorkAuthorizationState {
  switch (currentState) {
    case "pending_approval":
      if (transition === "approve") {
        return "approved";
      }

      if (transition === "reject") {
        return "rejected";
      }

      break;

    case "approved":
      if (transition === "authorize") {
        return "authorized";
      }

      break;
  }

  throw new Error(
    `Invalid authorization transition: ${currentState} -> ${transition}`,
  );
}

export type WorkDecisionRecord = {
  source: "ai" | "human";
  decision: string;
  authorization: WorkAuthorizationState;
};

export type CreateWorkDecisionRecordInput = WorkDecisionRecord;

export function createWorkDecisionRecord(
  input: CreateWorkDecisionRecordInput,
): WorkDecisionRecord {
  return {
    source: input.source,
    decision: input.decision,
    authorization: input.authorization,
  };
}
