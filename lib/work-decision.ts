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