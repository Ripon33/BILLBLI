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

  const hasDecisionInformation =
    (input.risks?.length ?? 0) > 0 ||
    (input.decisionFactors?.length ?? 0) > 0 ||
    (input.tradeoffs?.length ?? 0) > 0;

  if (input.confidence < 40 && hasDecisionInformation) {
    actions.push({
      action: "Gather stronger evidence",
      priority: "critical",
      reason:
        "Low decision confidence means stronger evidence is needed before acting.",
      checkpoint:
        "Reassess the decision after materially stronger evidence is available.",
    });
  }

  for (const risk of input.risks ?? []) {
    if (/regulatory uncertainty/i.test(risk)) {
      actions.push({
        action: "Verify applicable licensing requirements",
        priority: "critical",
        reason: `${risk} is a material risk to the decision.`,
        checkpoint:
          "Confirm the applicable licensing requirements before acting on the decision.",
      });
      continue;
    }

    if (/high setup cost/i.test(risk)) {
      actions.push({
        action: "Validate setup cost",
        priority: "critical",
        reason: `${risk} is a material risk to the decision.`,
        checkpoint:
          "Confirm the setup cost remains acceptable for the decision.",
      });
      continue;
    }

    if (/seasonal demand/i.test(risk)) {
      actions.push({
        action: "Validate seasonal demand",
        priority: "critical",
        reason: "Seasonal demand is a material risk to the decision.",
        checkpoint:
          "Confirm demand remains strong enough to support the decision.",
      });
      continue;
    }

    const normalizedRisk = risk
      .replace(/^(major|material|critical|significant|high|low)\s+/i, "")
      .replace(/\s+risk$/i, "")
      .trim();

    if (normalizedRisk) {
      actions.push({
        action: `Validate ${normalizedRisk.toLowerCase()}`,
        priority: "critical",
        reason: `${risk} is a material risk to the decision.`,
        checkpoint: `Confirm the ${normalizedRisk.toLowerCase()} remains acceptable for the decision.`,
      });
    }
  }

  for (const tradeoff of input.tradeoffs ?? []) {
    if (/higher investment versus stronger quality/i.test(tradeoff)) {
      actions.push({
        action:
          "Validate whether the quality gain justifies the additional investment",
        priority: "important",
        reason:
          "The investment versus quality trade-off is material to the decision.",
        checkpoint:
          "Confirm the expected quality gain is sufficient to justify the additional investment.",
      });
      continue;
    }

    if (/lower cost versus lower reliability/i.test(tradeoff)) {
      actions.push({
        action: "Validate whether the reliability trade-off is acceptable",
        priority: "important",
        reason:
          "The cost versus reliability trade-off is material to the decision.",
        checkpoint:
          "Confirm the lower reliability remains acceptable for the expected cost savings.",
      });
      continue;
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
      continue;
    }

    if (/^Location:/i.test(factor)) {
      actions.push({
        action: "Validate location-specific assumptions",
        priority: "important",
        reason: "Location is a key decision factor.",
        checkpoint:
          "Confirm the decision assumptions remain valid for the stated location.",
      });
    }
  }

  return {
    actions: [...new Map(actions.map((item) => [item.action, item])).values()],
  };
}
