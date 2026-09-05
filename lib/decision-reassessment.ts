export interface DecisionReassessmentInput {
  recommendation: "proceed" | "do_not_proceed" | "conditional";
  confidence: number;
  risks: string[];
  tradeoffs: string[];
}

export interface DecisionReassessment {
  reassessmentTriggers: string[];
  whatWouldChange: string[];
}

export function buildDecisionReassessment(
  input: DecisionReassessmentInput,
): DecisionReassessment {
  const reassessmentTriggers = [...new Set(input.risks.filter(Boolean))];

  const whatWouldChange = [
    ...reassessmentTriggers.map(
      (risk) => `If ${risk.toLowerCase()} changes materially, reassess the decision.`,
    ),
    ...(input.tradeoffs.length > 0
      ? ["If the key trade-offs change materially, reassess the decision."]
      : []),
    ...(input.confidence < 70
      ? ["Stronger evidence could materially change the decision."]
      : []),
  ];

  return {
    reassessmentTriggers,
    whatWouldChange: [...new Set(whatWouldChange)],
  };
}
