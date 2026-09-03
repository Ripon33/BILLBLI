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
