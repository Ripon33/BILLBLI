export type ActionPriority = "critical" | "important" | "optional";

export interface DecisionActionPlanInput {
  recommendation: "proceed" | "do_not_proceed" | "conditional";
  confidence: number;
  decisionFactors?: string[];
  risks?: string[];
  tradeoffs?: string[];
}

export interface DecisionAction {
  action: string;
  priority: ActionPriority;
  reason: string;
  checkpoint: string;
}

export interface DecisionActionPlan {
  actions: DecisionAction[];
}

export function buildDecisionActionPlan(
  input: DecisionActionPlanInput,
): DecisionActionPlan {
  const actions: DecisionAction[] = [];

  for (const risk of input.risks ?? []) {
    if (/seasonal demand/i.test(risk)) {
      actions.push({
        action: "Validate seasonal demand",
        priority: "critical",
        reason: "Seasonal demand is a material risk to the decision.",
        checkpoint:
          "Confirm demand remains strong enough to support the decision.",
      });
    }
  }

  for (const factor of input.decisionFactors ?? []) {
    if (/^Budget:/i.test(factor)) {
      actions.push({
        action: "Validate the decision budget",
        priority: "important",
        reason: "Budget is a key decision factor.",
        checkpoint: "Confirm the plan remains within the stated budget.",
      });
    }
  }

  return {
    actions: [...new Map(actions.map((item) => [item.action, item])).values()],
  };
}
