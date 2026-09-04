import type { DecisionContext } from "./decision-context";

export function buildResearchPlan(
  question: string,
  context?: DecisionContext,
) {
  return {
    question,
    context: context ?? null,
    topics: [
      "market demand",
      "competitors",
      "pricing and economics",
      "customer segments",
      "technology",
      "regulation and risks",
      "contradictory evidence",
    ],
    evidence_rules: {
      separate_fact_from_inference: true,
      flag_assumptions: true,
      detect_conflicts: true,
      cite_material_claims: true,
    },
    final_output: [
      "recommendation",
      "evidence_confidence",
      "decision_factors",
      "risks",
      "reassessment_triggers",
      "sources",
    ],
  };
}
