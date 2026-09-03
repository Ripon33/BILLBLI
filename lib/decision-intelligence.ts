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
