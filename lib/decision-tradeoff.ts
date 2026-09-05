import type { DecisionContext } from "./decision-context";
import type { RankedEvidenceSource } from "./evidence-ranking";

export interface DecisionTradeoffResult {
  benefits: string[];
  risks: string[];
  tradeoffs: string[];
  decisionFactors: string[];
}

export function buildDecisionTradeoffs(
  context: DecisionContext,
  evidence: RankedEvidenceSource[],
): DecisionTradeoffResult {
  const benefits: string[] = [];
  const risks: string[] = [];
  const tradeoffs: string[] = [];
  const decisionFactors: string[] = [];

  for (const source of evidence) {
    const text = `${source.title ?? ""} ${source.content ?? ""}`.trim();

    if (/\b(opportunit|strong demand|growth|benefit|advantage|potential|reduce setup time|simplify operations|faster setup|quick setup)\w*/i.test(text)) {
      benefits.push(source.title ?? "Potential benefit");
    }

    if (/\b(risk|risks|seasonal|seasonality|weak demand|cost|costs|challenge|uncertain|setup time|setup period|longer setup|delay|delays)\w*/i.test(text)) {
      risks.push(source.title ?? "Potential risk");
    }
  }

  if (benefits.length > 0 && risks.length > 0) {
    tradeoffs.push(
      `${benefits[0]} may need to be weighed against ${risks[0]}.`,
    );
  }

  if (context.budget) {
    decisionFactors.push(`Budget: ${context.budget}`);
  }

  if (context.timeframe) {
    decisionFactors.push(`Timeframe: ${context.timeframe}`);
  }

  if (context.location) {
    decisionFactors.push(`Location: ${context.location}`);
  }

  return {
    benefits: [...new Set(benefits)],
    risks: [...new Set(risks)],
    tradeoffs: [...new Set(tradeoffs)],
    decisionFactors: [...new Set(decisionFactors)],
  };
}
