export interface DecisionBoxSummaryInput {
  recommendation: string;
  score: number;
  confidence: number;
  rationale: string;
  state: string;
  risks: string[];
  assumptions: string[];
  conflicts: Array<Record<string, unknown>>;
  reassessment_triggers: string[];
  decision_factors: Array<{
    name: string;
    score: number;
    weight: number;
    evidence_strength: number;
    explanation: string;
  }>;
}

export function getDecisionBoxSummary(input: DecisionBoxSummaryInput) {
  return {
    recommendation: input.recommendation,
    score: input.score,
    confidence: input.confidence,
    rationale: input.rationale,
    state: input.state,
    decision_factors: input.decision_factors,
    risks: input.risks,
    assumptions: input.assumptions,
    conflicts: input.conflicts,
    reassessment_triggers: input.reassessment_triggers,
  };
}
