export interface DecisionDetailInput {
  benefits?: string[];
  risks?: string[];
  tradeoffs?: string[];
  decisionFactors?: string[];
}

export interface DecisionDetailItems {
  benefits: string[];
  risks: string[];
  tradeoffs: string[];
  decisionFactors: string[];
}

export function getDecisionDetailItems(
  input: DecisionDetailInput,
): DecisionDetailItems {
  return {
    benefits: [...new Set(input.benefits ?? [])],
    risks: [...new Set(input.risks ?? [])],
    tradeoffs: [...new Set(input.tradeoffs ?? [])],
    decisionFactors: [...new Set(input.decisionFactors ?? [])],
  };
}
