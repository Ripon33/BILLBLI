import type { DecisionConflict, Evidence } from "./decision-intelligence";
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

export function buildEvidenceFromRankedSource(
  source: RankedEvidenceSource,
  sourceId: string,
  claimId: string,
): Evidence {
  return {
    id: `evidence-${sourceId}`,
    source_id: sourceId,
    claim: source.content || source.title || claimId,
    polarity: "supporting",
    type: "fact",
    strength: source.evidence_score,
    verification: "verified",
  };
}

export function buildGroundedClaim(
  claimId: string,
  text: string,
  evidenceIds: string[],
  availableEvidenceIds?: Set<string>,
): Claim {
  if (availableEvidenceIds) {
    for (const evidenceId of evidenceIds) {
      if (!availableEvidenceIds.has(evidenceId)) {
        throw new Error(
          `Claim ${claimId} references missing evidence ${evidenceId}.`,
        );
      }
    }
  }

  return {
    claimId,
    text,
    evidenceIds,
  };
}

export function buildProvenanceGraphFromRankedSources(
  rankedSources: RankedEvidenceSource[],
  claims: Claim[] = [],
  links: ClaimEvidenceLink[] = [],
  conflicts: DecisionConflict[] = [],
): ProvenanceGraph {
  const sources: EvidenceProvenance[] = [];
  const evidence: Evidence[] = [];

  rankedSources.forEach((source, index) => {
    const sourceId = `source-${index + 1}`;

    sources.push(
      buildEvidenceProvenanceFromRankedSource(source, sourceId),
    );

    evidence.push(
      buildEvidenceFromRankedSource(source, sourceId, `claim-${index + 1}`),
    );
  });

  return {
    sources,
    evidence,
    claims,
    links,
    conflicts,
  };
}

export function buildClaimEvidenceLink(
  claimId: string,
  evidenceId: string,
  relationship: ClaimEvidenceLink["relationship"],
  relevance: number,
): ClaimEvidenceLink {
  return {
    claimId,
    evidenceId,
    relationship,
    relevance,
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
export type ProvenanceGraph = {
  sources: EvidenceProvenance[];
  evidence: Evidence[];
  claims: Claim[];
  links: ClaimEvidenceLink[];
  conflicts: DecisionConflict[];
  coverage?: EvidenceCoverage;
};

export type EvidenceCoverage = {
  totalClaims: number;
  groundedClaims: number;
  coverage: number;
  status:
    | "fully_grounded"
    | "partially_grounded"
    | "unsupported"
    | "no_claims";
};

export function calculateEvidenceCoverage(
  graph: ProvenanceGraph,
): EvidenceCoverage {
  const totalClaims = graph.claims.length;

  if (totalClaims === 0) {
    return {
      totalClaims: 0,
      groundedClaims: 0,
      coverage: 0,
      status: "no_claims",
    };
  }

  const evidenceIds = new Set(graph.evidence.map((evidence) => evidence.id));

  const groundedClaims = graph.claims.filter((claim) => {
    return claim.evidenceIds.some((evidenceId) => {
      const evidence = graph.evidence.find(
        (candidate) => candidate.id === evidenceId,
      );

      return (
        evidenceIds.has(evidenceId) &&
        evidence?.polarity === "supporting" &&
        evidence.strength > 0 &&
        evidence.verification === "verified"
      );
    });
  }).length;

  const coverage = groundedClaims / totalClaims;

  let status: EvidenceCoverage["status"];

  if (groundedClaims === 0) {
    status = "unsupported";
  } else if (groundedClaims === totalClaims) {
    status = "fully_grounded";
  } else {
    status = "partially_grounded";
  }

  return {
    totalClaims,
    groundedClaims,
    coverage,
    status,
  };
}

export function validateProvenanceGraph(graph: ProvenanceGraph): void {
  const sourceIds = new Set(graph.sources.map((source) => source.sourceId));
  const evidenceIds = new Set(graph.evidence.map((evidence) => evidence.id));

  for (const evidence of graph.evidence) {
    if (!sourceIds.has(evidence.source_id)) {
      throw new Error(
        `Evidence ${evidence.id} references missing source ${evidence.source_id}.`,
      );
    }
  }

  const claimIds = new Set(graph.claims.map((claim) => claim.claimId));

  for (const claim of graph.claims) {
    for (const evidenceId of claim.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) {
        throw new Error(
          `Claim ${claim.claimId} references missing evidence ${evidenceId}.`,
        );
      }
    }
  }

  for (const conflict of graph.conflicts ?? []) {
    for (const claimId of conflict.claim_ids) {
      if (!claimIds.has(claimId)) {
        throw new Error(
          `Decision conflict ${conflict.id} references missing claim ${claimId}.`,
        );
      }
    }

    for (const evidenceId of conflict.evidence_ids) {
      if (!evidenceIds.has(evidenceId)) {
        throw new Error(
          `Decision conflict ${conflict.id} references missing evidence ${evidenceId}.`,
        );
      }
    }
  }

  for (const link of graph.links) {
    if (!claimIds.has(link.claimId)) {
      throw new Error(
        `Claim evidence link references missing claim ${link.claimId}.`,
      );
    }

    if (!evidenceIds.has(link.evidenceId)) {
      throw new Error(
        `Claim evidence link references missing evidence ${link.evidenceId}.`,
      );
    }

    if (
      !["supports", "contradicts", "context"].includes(link.relationship)
    ) {
      throw new Error(
        `Claim ${link.claimId} has an invalid evidence relationship.`,
      );
    }

    if (link.relevance < 0 || link.relevance > 100) {
      throw new Error(
        `Claim ${link.claimId} has evidence relevance outside 0-100.`,
      );
    }
  }
}

export function buildGroundedClaimsFromResearchAnalysis(
  analysis: {
    key_facts?: Array<{ fact: string; sources?: number[] }>;
    evidence_for?: Array<{ point: string; sources?: number[] }>;
    evidence_against?: Array<{ point: string; sources?: number[] }>;
  },
  graph: ProvenanceGraph,
): { claims: Claim[]; links: ClaimEvidenceLink[] } {
  const claims: Claim[] = [];
  const links: ClaimEvidenceLink[] = [];
  const evidenceIds = new Set(graph.evidence.map((evidence) => evidence.id));

  const addClaims = (
    items: Array<{ fact?: string; point?: string; sources?: number[] }>,
    relationship: ClaimEvidenceLink["relationship"],
  ) => {
    for (const item of items) {
      const text = item.fact ?? item.point ?? "";
      const sourceNumbers = item.sources ?? [];

      const evidenceIdsForClaim = sourceNumbers.map((sourceNumber) => {
        const evidenceId = `evidence-source-${sourceNumber}`;

        if (!evidenceIds.has(evidenceId)) {
          throw new Error(
            `Claim references missing evidence ${evidenceId}.`,
          );
        }

        return evidenceId;
      });

      const claimId = `claim-${claims.length + 1}`;

      claims.push({
        claimId,
        text,
        evidenceIds: evidenceIdsForClaim,
      });

      for (const evidenceId of evidenceIdsForClaim) {
        links.push({
          claimId,
          evidenceId,
          relationship,
          relevance: 100,
        });
      }
    }
  };

  addClaims(analysis.key_facts ?? [], "supports");
  addClaims(analysis.evidence_for ?? [], "supports");
  addClaims(analysis.evidence_against ?? [], "contradicts");

  return { claims, links };
}

export function buildResearchResultProvenance(
  rankedSources: RankedEvidenceSource[],
  claims: Claim[] = [],
  links: ClaimEvidenceLink[] = [],
  conflicts: DecisionConflict[] = [],
): ProvenanceGraph {
  const graph = buildProvenanceGraphFromRankedSources(
    rankedSources,
    claims,
    links,
    conflicts,
  );

  return {
    ...graph,
    coverage: calculateEvidenceCoverage(graph),
  };
}
