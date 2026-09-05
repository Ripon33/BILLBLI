export interface DecisionRecommendationInput {
  score: number;
  confidence: number;
  risks: string[];
  tradeoffs: string[];
}

export interface DecisionRecommendation {
  recommendation: "proceed" | "do_not_proceed" | "conditional";
  confidence: number;
  why: string[];
  risks: string[];
  tradeoffs: string[];
}

export function buildDecisionRecommendation(
  input: DecisionRecommendationInput,
): DecisionRecommendation {
  const hasMaterialRisk = input.risks.some((risk) =>
    /major|material|critical|significant|severe/i.test(risk),
  );

  const recommendation =
    hasMaterialRisk
      ? "conditional"
      : input.score >= 75 && input.confidence >= 70
        ? "proceed"
        : input.score < 50 || input.confidence < 40
          ? "do_not_proceed"
          : "conditional";

  const why =
    recommendation === "proceed"
      ? ["The decision score and evidence confidence are strong."]
      : recommendation === "do_not_proceed"
        ? ["The decision score or evidence confidence is too weak."]
        : ["The decision has meaningful uncertainty and should be treated conditionally."];

  return {
    recommendation,
    confidence: input.confidence,
    why,
    risks: input.risks,
    tradeoffs: input.tradeoffs,
  };
}
