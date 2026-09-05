import type { RankedEvidenceSource } from "./evidence-ranking";

export type EvidenceProvenance = {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  authorityType: string;
  authorityScore: number;
  rankingScore: number;
  evidenceScore: number;
};

export type RankedEvidenceProvenance = EvidenceProvenance & {
  relevanceScore: number;
  directnessScore: number;
};

export type Claim = {
  claimId: string;
  text: string;
  evidenceIds: string[];
};

export type ClaimEvidenceLink = {
  claimId: string;
  evidenceId: string;
  relationship: "supports" | "contradicts" | "context";
  relevance: number;
};

function normalizeDomain(url: string): string {
  try {
    return (
      new URL(url).hostname.replace(/^www\./, "").toLowerCase() || "unknown"
    );
  } catch {
    return "unknown";
  }
}

export function buildEvidenceProvenance(input: {
  sourceId: string;
  title: string;
  url: string;
  authorityType: string;
  authorityScore: number;
  rankingScore: number;
  evidenceScore: number;
}): EvidenceProvenance {
  return {
    sourceId: input.sourceId,
    sourceTitle: input.title || "Untitled",
    sourceUrl: input.url || "",
    sourceDomain: normalizeDomain(input.url),
    authorityType: input.authorityType,
    authorityScore: input.authorityScore,
    rankingScore: input.rankingScore,
    evidenceScore: input.evidenceScore,
  };
}

export function buildEvidenceProvenanceFromRankedSource(
  source: RankedEvidenceSource,
  sourceId: string,
): RankedEvidenceProvenance {
  return {
    ...buildEvidenceProvenance({
      sourceId,
      title: source.title || "Untitled",
      url: source.url || "",
      authorityType: source.authority.type,
      authorityScore: source.authority.score,
      rankingScore: Math.round((source.score ?? 0) * 100),
      evidenceScore: source.evidence_score,
    }),
    relevanceScore: source.relevance_score,
    directnessScore: source.directness_score,
  };
}

export function validateClaimEvidenceLinks(
  claim: Claim,
  links: ClaimEvidenceLink[],
  evidenceIds: Set<string>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const evidenceId of claim.evidenceIds) {
    if (!evidenceIds.has(evidenceId)) {
      errors.push(
        `Claim ${claim.claimId} references missing evidence ${evidenceId}.`,
      );
    }
  }

  for (const link of links) {
    if (link.claimId !== claim.claimId) continue;

    if (!evidenceIds.has(link.evidenceId)) {
      errors.push(
        `Claim ${claim.claimId} references missing evidence ${link.evidenceId}.`,
      );
    }

    if (
      !["supports", "contradicts", "context"].includes(link.relationship)
    ) {
      errors.push(
        `Claim ${claim.claimId} has an invalid evidence relationship.`,
      );
    }

    if (link.relevance < 0 || link.relevance > 100) {
      errors.push(
        `Claim ${claim.claimId} has evidence relevance outside 0-100.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}