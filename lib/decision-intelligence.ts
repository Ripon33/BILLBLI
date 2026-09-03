export type EvidenceType =
  | "fact"
  | "inference"
  | "forecast"
  | "opinion";

export type EvidencePolarity =
  | "supporting"
  | "against"
  | "neutral";

export type VerificationStatus =
  | "verified"
  | "corroborated"
  | "single_source"
  | "unverified";

export type DecisionState =
  | "INSUFFICIENT_EVIDENCE"
  | "CONTESTED_DECISION"
  | "DIRECTIONAL_RECOMMENDATION"
  | "RECOMMENDATION";

export interface DecisionFactor {
  name: string;
  score: number;
  weight: number;
  evidence_strength: number;
  explanation: string;
}

export interface Claim {
  id: string;
  statement: string;
  type: EvidenceType;
  confidence: number;
  evidence_ids: string[];
}

export interface Evidence {
  id: string;
  source_id: string;
  claim: string;
  polarity: EvidencePolarity;
  type: EvidenceType;
  strength: number;
  verification: VerificationStatus;
}

export interface DecisionConflict {
  id: string;
  claim_ids: string[];
  evidence_ids: string[];
  severity: "minor" | "material";
  explanation: string;
}

export interface Alternative {
  option: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Decision {
  recommendation: string;
  score: number;
  confidence: number;
  rationale: string;
  state: DecisionState;
}

export interface DecisionObject {
  question: string;
  decision: Decision;
  decision_factors: DecisionFactor[];
  claims: Claim[];
  evidence: Evidence[];
  alternatives: Alternative[];
  risks: string[];
  assumptions: string[];
  conflicts: DecisionConflict[];
  reassessment_triggers: string[];
  sources: unknown[];
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function validateFactorWeights(
  factors: Array<{ name: string; weight: number }>,
): boolean {
  const total = factors.reduce(
    (sum, factor) => sum + factor.weight,
    0,
  );

  return Math.abs(total - 100) < 0.000001;
}

export function validateEvidenceReferences(
  evidence: Evidence[],
  sources: Array<{ id: string }>,
): boolean {
  const sourceIds = new Set(
    sources.map((source) => source.id),
  );

  return evidence.every((item) =>
    sourceIds.has(item.source_id),
  );
}


export function extractStructuredEvidence(
  sources: Array<{ id: string; text: string }>,
): Evidence[] {
  return sources
    .filter((source) => source.text.trim().length > 0)
    .map((source) => {
      const text = source.text.trim();
      const lower = text.toLowerCase();

      const type: EvidenceType =
        /forecast|forecasted|predict|predicted|expected|will increase|will decrease|next year/.test(
          lower,
        )
          ? "forecast"
          : "fact";

      const polarity: EvidencePolarity =
        /declined|decreased|fell|drop|negative|risk|against/.test(lower)
          ? "against"
          : "supporting";

      return {
        id: `evidence-${source.id}`,
        source_id: source.id,
        claim: text,
        polarity,
        type,
        strength: 50,
        verification: "single_source",
      };
    });
}

export function extractClaims(evidence: Evidence[]): Claim[] {
  const groups = new Map<string, Evidence[]>();

  for (const item of evidence) {
    const key = item.claim.trim().toLowerCase();
    if (!key) continue;

    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return Array.from(groups.values()).map((items, index) => ({
    id: `claim-${index + 1}`,
    statement: items[0].claim,
    type: items[0].type,
    confidence: Math.round(
      items.reduce((sum, item) => sum + item.strength, 0) /
        items.length,
    ),
    evidence_ids: items.map((item) => item.id),
  }));
}

export function scoreEvidence(input: {
  authority: number;
  relevance: number;
  directness: number;
  freshness: number;
  corroboration: number;
}): number {
  const score =
    (input.authority *
      input.relevance *
      input.directness *
      input.freshness *
      input.corroboration) /
    100000000;

  return Math.round(clampScore(score));
}

export function calculateDecisionScore(
  factors: Array<{ name: string; score: number; weight: number }>,
): number {
  if (!validateFactorWeights(factors)) {
    throw new Error("Factor weights must total 100");
  }

  const weightedScore = factors.reduce(
    (total, factor) =>
      total + clampScore(factor.score) * (factor.weight / 100),
    0,
  );

  return Math.round(clampScore(weightedScore));
}

export function detectConflicts(
  evidence: Evidence[],
): DecisionConflict[] {
  const groups = new Map<string, Evidence[]>();

  for (const item of evidence) {
    const key = item.claim.trim().toLowerCase();
    if (!key) continue;

    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const conflicts: DecisionConflict[] = [];

  for (const [claim, items] of groups) {
    const hasSupporting = items.some(
      (item) => item.polarity === "supporting",
    );
    const hasAgainst = items.some(
      (item) => item.polarity === "against",
    );

    if (hasSupporting && hasAgainst) {
      conflicts.push({
        id: `conflict-${conflicts.length + 1}`,
        claim_ids: [],
        evidence_ids: items.map((item) => item.id),
        severity: "material",
        explanation: `Conflicting evidence exists for: ${claim}`,
      });
    }
  }

  return conflicts;
}

export function buildDecision(input: {
  question: string;
  score: number;
  confidence: number;
  conflicts: DecisionConflict[];
}): Decision {
  const score = clampScore(input.score);
  const confidence = clampScore(input.confidence);

  let state: DecisionState;
  let recommendation: string;

  if (confidence < 50) {
    state = "INSUFFICIENT_EVIDENCE";
    recommendation = "Insufficient evidence";
  } else if (
    input.conflicts.some((conflict) => conflict.severity === "material")
  ) {
    state = "CONTESTED_DECISION";
    recommendation = "Proceed with caution";
  } else if (confidence < 70) {
    state = "DIRECTIONAL_RECOMMENDATION";
    recommendation = score >= 50 ? "Proceed directionally" : "Do not proceed directionally";
  } else {
    state = "RECOMMENDATION";
    recommendation = score >= 50 ? "Proceed" : "Do not proceed";
  }

  return {
    recommendation,
    score,
    confidence,
    state,
    rationale: `Decision based on a score of ${score} and evidence confidence of ${confidence}.`,
  };
}

export function validateDecisionObject(
  decision: DecisionObject,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateFactorWeights(decision.decision_factors)) {
    errors.push("Factor weights must total 100");
  }

  if (
    decision.decision.score < 0 ||
    decision.decision.score > 100
  ) {
    errors.push("Decision score must be between 0 and 100");
  }

  if (
    !validateEvidenceReferences(
      decision.evidence,
      decision.sources as Array<{ id: string }>,
    )
  ) {
    errors.push("Evidence references an unknown source");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildResearchDecision(input: {
  question: string;
  sources: unknown[];
  evidence: Evidence[];
  factors: DecisionFactor[];
}): {
  valid: boolean;
  errors: string[];
  decision: DecisionObject;
} {
  const claims = extractClaims(input.evidence);
  const conflicts = detectConflicts(input.evidence);
  const score = calculateDecisionScore(input.factors);

  const evidenceStrength =
    input.evidence.length === 0
      ? 0
      : Math.round(
          input.evidence.reduce(
            (sum, item) => sum + item.strength,
            0,
          ) / input.evidence.length,
        );

  const decision = buildDecision({
    question: input.question,
    score,
    confidence: evidenceStrength,
    conflicts,
  });

  const decisionObject: DecisionObject = {
    question: input.question,
    decision,
    decision_factors: input.factors,
    claims,
    evidence: input.evidence,
    alternatives: [],
    risks: [],
    assumptions: [],
    conflicts,
    reassessment_triggers: [],
    sources: input.sources,
  };

  const validation = validateDecisionObject(decisionObject);

  return {
    valid: validation.valid,
    errors: validation.errors,
    decision: decisionObject,
  };
}
