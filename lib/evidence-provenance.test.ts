import { buildResearchResultProvenance, buildGroundedClaimsFromResearchAnalysis } from "./evidence-provenance";
import { describe, expect, it } from "vitest";
import {
  buildEvidenceProvenance,
  buildEvidenceProvenanceFromRankedSource,
  buildEvidenceFromRankedSource,
  buildProvenanceGraphFromRankedSources,
  buildGroundedClaim,
  buildClaimEvidenceLink,
  validateClaimEvidenceLinks,
  validateProvenanceGraph,
  calculateEvidenceCoverage,
} from "./evidence-provenance";

describe("evidence provenance", () => {
  it("builds normalized source provenance", () => {
    const result = buildEvidenceProvenance({
      sourceId: "source-1",
      title: "Example Report",
      url: "https://www.example.com/report/123",
      authorityType: "official",
      authorityScore: 90,
      rankingScore: 92,
      evidenceScore: 88,
    });

    expect(result).toEqual({
      sourceId: "source-1",
      sourceTitle: "Example Report",
      sourceUrl: "https://www.example.com/report/123",
      sourceDomain: "example.com",
      authorityType: "official",
      authorityScore: 90,
      rankingScore: 92,
      evidenceScore: 88,
    });
  });

  it("validates a claim supported by existing evidence", () => {
    const result = validateClaimEvidenceLinks(
      {
        claimId: "claim-1",
        text: "The evidence supports this claim.",
        evidenceIds: ["evidence-1"],
      },
      [
        {
          claimId: "claim-1",
          evidenceId: "evidence-1",
          relationship: "supports",
          relevance: 90,
        },
      ],
      new Set(["evidence-1"]),
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a claim referencing missing evidence", () => {
    const result = validateClaimEvidenceLinks(
      {
        claimId: "claim-1",
        text: "Unsupported claim.",
        evidenceIds: ["evidence-missing"],
      },
      [],
      new Set(["evidence-1"]),
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Claim claim-1 references missing evidence evidence-missing.",
    );
  });

  it("normalizes www subdomains and preserves the original URL", () => {
    const result = buildEvidenceProvenance({
      sourceId: "source-2",
      title: "Official Report",
      url: "https://www.example.org/report",
      authorityType: "official",
      authorityScore: 95,
      rankingScore: 94,
      evidenceScore: 93,
    });

    expect(result.sourceDomain).toBe("example.org");
    expect(result.sourceUrl).toBe("https://www.example.org/report");
  });

  it("uses unknown for an invalid source URL", () => {
    const result = buildEvidenceProvenance({
      sourceId: "source-3",
      title: "Broken Source",
      url: "not-a-valid-url",
      authorityType: "general_web_source",
      authorityScore: 20,
      rankingScore: 10,
      evidenceScore: 15,
    });

    expect(result.sourceDomain).toBe("unknown");
    expect(result.sourceUrl).toBe("not-a-valid-url");
  });

  it("uses unknown for an empty source URL", () => {
    const result = buildEvidenceProvenance({
      sourceId: "source-4",
      title: "Missing URL",
      url: "",
      authorityType: "general_web_source",
      authorityScore: 20,
      rankingScore: 10,
      evidenceScore: 15,
    });

    expect(result.sourceDomain).toBe("unknown");
    expect(result.sourceUrl).toBe("");
  });

  it("builds provenance from an existing ranked evidence source", () => {
    const result = buildEvidenceProvenance({
      sourceId: "source-5",
      title: "Official Market Report",
      url: "https://www.example.org/report",
      authorityType: "official",
      authorityScore: 95,
      rankingScore: 91,
      evidenceScore: 94,
    });

    expect(result).toEqual({
      sourceId: "source-5",
      sourceTitle: "Official Market Report",
      sourceUrl: "https://www.example.org/report",
      sourceDomain: "example.org",
      authorityType: "official",
      authorityScore: 95,
      rankingScore: 91,
      evidenceScore: 94,
    });
  });

  it("builds provenance directly from a ranked evidence source", () => {
    const result = buildEvidenceProvenanceFromRankedSource(
  {
    title: "Official Market Study",
    url: "https://www.example.gov/study",
    content: "Market evidence...",
    score: 0.91,
    authority: {
      type: "official",
      score: 95,
    },
    relevance_score: 93,
    directness_score: 89,
    evidence_score: 94,
  },
  "source-6",
);

    expect(result).toEqual({
      sourceId: "source-6",
      sourceTitle: "Official Market Study",
      sourceUrl: "https://www.example.gov/study",
      sourceDomain: "example.gov",
      authorityType: "official",
      authorityScore: 95,
      rankingScore: 91,
      evidenceScore: 94,
      relevanceScore: 93,
      directnessScore: 89,
    });
  });
});
describe("Research source provenance pipeline", () => {
  it("preserves ranked source identity and scoring metadata in provenance", () => {
    const rankedSource = {
      title: "Official Policy Report",
      content: "The policy was approved.",
      url: "https://www.example.gov/policy",
      score: 0.87,
      authority: {
        score: 95,
        type: "government",
      },
      relevance_score: 92,
      directness_score: 88,
      evidence_score: 91,
    };

    const provenance = buildEvidenceProvenanceFromRankedSource(
      rankedSource,
      "source-7",
    );

    expect(provenance).toEqual({
      sourceId: "source-7",
      sourceTitle: "Official Policy Report",
      sourceUrl: "https://www.example.gov/policy",
      sourceDomain: "example.gov",
      authorityType: "government",
      authorityScore: 95,
      rankingScore: 87,
      evidenceScore: 91,
      relevanceScore: 92,
      directnessScore: 88,
    });
  });

  it("creates evidence with the deterministic ranked source ID", () => {
    const rankedSource = {
      title: "Official Policy Report",
      content: "The policy was approved.",
      url: "https://www.example.gov/policy",
      score: 0.87,
      authority: {
        score: 95,
        type: "government",
      },
      relevance_score: 92,
      directness_score: 88,
      evidence_score: 91,
    };

    const evidence = buildEvidenceFromRankedSource(
      rankedSource,
      "source-7",
      "claim-1",
    );

    expect(evidence).toEqual({
      id: "evidence-source-7",
      source_id: "source-7",
      claim: "The policy was approved.",
      polarity: "supporting",
      type: "fact",
      strength: 91,
      verification: "verified",
    });
  });

  it("preserves contradictory and contextual claim-to-evidence relationships", () => {
    const contradictory = buildClaimEvidenceLink(
      "claim-1",
      "evidence-2",
      "contradicts",
      88,
    );

    const contextual = buildClaimEvidenceLink(
      "claim-1",
      "evidence-3",
      "context",
      61,
    );

    expect(contradictory).toEqual({
      claimId: "claim-1",
      evidenceId: "evidence-2",
      relationship: "contradicts",
      relevance: 88,
    });

    expect(contextual).toEqual({
      claimId: "claim-1",
      evidenceId: "evidence-3",
      relationship: "context",
      relevance: 61,
    });
  });

  it("preserves supporting and contradictory evidence separately for one claim", () => {
    const claim = buildGroundedClaim(
      "claim-1",
      "The market opportunity is attractive.",
      ["evidence-source-1", "evidence-source-2"],
      new Set(["evidence-source-1", "evidence-source-2"]),
    );

    const links = [
      buildClaimEvidenceLink(
        claim.claimId,
        "evidence-source-1",
        "supports",
        92,
      ),
      buildClaimEvidenceLink(
        claim.claimId,
        "evidence-source-2",
        "contradicts",
        81,
      ),
    ];

    expect(links).toEqual([
      {
        claimId: "claim-1",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 92,
      },
      {
        claimId: "claim-1",
        evidenceId: "evidence-source-2",
        relationship: "contradicts",
        relevance: 81,
      },
    ]);

    expect(links.filter((link) => link.relationship === "supports")).toHaveLength(1);
    expect(
      links.filter((link) => link.relationship === "contradicts"),
    ).toHaveLength(1);
  });

  it("supports multiple evidence items for one claim", () => {
    const claim = {
      claimId: "claim-1",
      text: "The recommendation is supported by multiple sources.",
      evidenceIds: ["evidence-source-1", "evidence-source-2"],
    };

    const links = [
      buildClaimEvidenceLink(
        claim.claimId,
        "evidence-source-1",
        "supports",
        92,
      ),
      buildClaimEvidenceLink(
        claim.claimId,
        "evidence-source-2",
        "supports",
        84,
      ),
    ];

    expect(claim.evidenceIds).toHaveLength(2);
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.evidenceId)).toEqual([
      "evidence-source-1",
      "evidence-source-2",
    ]);
  });

  it("builds an explicit claim-to-evidence relationship", () => {
    const link = buildClaimEvidenceLink(
      "claim-1",
      "evidence-source-7",
      "supports",
      95,
    );

    expect(link).toEqual({
      claimId: "claim-1",
      evidenceId: "evidence-source-7",
      relationship: "supports",
      relevance: 95,
    });
  });
});

describe("Ranked source provenance pipeline", () => {
  it("rejects a grounded claim that references missing evidence", () => {
    expect(() =>
      buildGroundedClaim(
        "claim-1",
        "This claim has incomplete provenance.",
        ["evidence-source-1", "evidence-missing"],
        new Set(["evidence-source-1"]),
      ),
    ).toThrow(
      "Claim claim-1 references missing evidence evidence-missing.",
    );
  });

  it("builds an atomic claim grounded by multiple evidence records", () => {
    const evidenceIds = [
      "evidence-source-1",
      "evidence-source-2",
    ];

    const claim = buildGroundedClaim(
      "claim-1",
      "The market opportunity is supported by multiple independent sources.",
      evidenceIds,
    );

    expect(claim).toEqual({
      claimId: "claim-1",
      text: "The market opportunity is supported by multiple independent sources.",
      evidenceIds: [
        "evidence-source-1",
        "evidence-source-2",
      ],
    });
  });

  it("assigns deterministic source IDs from ranked source order", () => {
    const rankedSources = [
      {
        title: "First Source",
        content: "First source content.",
        url: "https://first.example.com",
        score: 0.9,
        authority: {
          score: 90,
          type: "primary_source",
        },
        relevance_score: 90,
        directness_score: 90,
        evidence_score: 90,
      },
      {
        title: "Second Source",
        content: "Second source content.",
        url: "https://second.example.com",
        score: 0.8,
        authority: {
          score: 80,
          type: "industry_report",
        },
        relevance_score: 80,
        directness_score: 80,
        evidence_score: 80,
      },
    ];

    const firstRun = buildProvenanceGraphFromRankedSources(rankedSources);
    const secondRun = buildProvenanceGraphFromRankedSources(rankedSources);

    expect(firstRun.sources.map((source) => source.sourceId)).toEqual([
      "source-1",
      "source-2",
    ]);

    expect(firstRun.sources).toEqual(secondRun.sources);
    expect(firstRun.evidence).toEqual(secondRun.evidence);
  });

  it("rejects generated graphs with claims referencing unavailable evidence", () => {
    const rankedSources = [
      {
        title: "Market Research",
        content: "The market is growing.",
        url: "https://example.com/market",
        score: 0.9,
        authority: {
          score: 85,
          type: "primary_source",
        },
        relevance_score: 91,
        directness_score: 88,
        evidence_score: 89,
      },
    ];

    const claims = [
      buildGroundedClaim(
        "claim-1",
        "This claim references unavailable evidence.",
        ["evidence-source-missing"],
      ),
    ];

    const graph = buildProvenanceGraphFromRankedSources(
      rankedSources,
      claims,
      [],
    );

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim claim-1 references missing evidence evidence-source-missing.",
    );
  });

  it("includes grounded claims and claim-evidence links in the generated graph", () => {
    const rankedSources = [
      {
        title: "Market Research",
        content: "The market is growing.",
        url: "https://example.com/market",
        score: 0.9,
        authority: {
          score: 85,
          type: "primary_source",
        },
        relevance_score: 91,
        directness_score: 88,
        evidence_score: 89,
      },
      {
        title: "Industry Report",
        content: "Industry demand is increasing.",
        url: "https://research.example.org/report",
        score: 0.8,
        authority: {
          score: 80,
          type: "industry_report",
        },
        relevance_score: 86,
        directness_score: 82,
        evidence_score: 84,
      },
    ];

    const claims = [
      buildGroundedClaim(
        "claim-1",
        "The market opportunity is attractive.",
        ["evidence-source-1", "evidence-source-2"],
      ),
    ];

    const links = [
      buildClaimEvidenceLink(
        "claim-1",
        "evidence-source-1",
        "supports",
        92,
      ),
      buildClaimEvidenceLink(
        "claim-1",
        "evidence-source-2",
        "supports",
        84,
      ),
    ];

    const graph = buildProvenanceGraphFromRankedSources(
      rankedSources,
      claims,
      links,
    );

    expect(graph.claims).toEqual(claims);
    expect(graph.links).toEqual(links);
  });

  it("validates the generated graph against its source provenance", () => {
    const rankedSources = [
      {
        title: "Validated Source",
        content: "Evidence from a validated source.",
        url: "https://validated.example.com",
        score: 0.9,
        authority: {
          score: 90,
          type: "primary_source",
        },
        relevance_score: 92,
        directness_score: 90,
        evidence_score: 91,
      },
    ];

    const graph = buildProvenanceGraphFromRankedSources(rankedSources);

    expect(() => validateProvenanceGraph(graph)).not.toThrow();
    expect(graph.evidence[0].source_id).toBe(
      graph.sources[0].sourceId,
    );
  });

  it("maps ranked sources into provenance sources and evidence records", () => {
    const rankedSources = [
      {
        title: "Market Research",
        content: "The market is growing.",
        url: "https://example.com/market",
        score: 0.9,
        authority: {
          score: 85,
          type: "primary_source",
        },
        relevance_score: 91,
        directness_score: 88,
        evidence_score: 89,
      },
      {
        title: "Industry Report",
        content: "Industry demand is increasing.",
        url: "https://research.example.org/report",
        score: 0.8,
        authority: {
          score: 80,
          type: "industry_report",
        },
        relevance_score: 86,
        directness_score: 82,
        evidence_score: 84,
      },
    ];

    const graph = buildProvenanceGraphFromRankedSources(rankedSources);

    expect(graph.sources).toHaveLength(2);
    expect(graph.evidence).toHaveLength(2);

    expect(graph.sources.map((source) => source.sourceId)).toEqual([
      "source-1",
      "source-2",
    ]);

    expect(graph.evidence.map((evidence) => evidence.source_id)).toEqual([
      "source-1",
      "source-2",
    ]);

    expect(graph.evidence.map((evidence) => evidence.id)).toEqual([
      "evidence-source-1",
      "evidence-source-2",
    ]);
  });
});

describe("Decision conflict provenance", () => {
  it("preserves conflict claim and evidence lineage", () => {
    const conflict = {
      id: "conflict-1",
      claim_ids: ["claim-1"],
      evidence_ids: [
        "evidence-source-1",
        "evidence-source-2",
      ],
      severity: "material" as const,
      explanation: "The sources disagree about market demand.",
    };

    expect(conflict.claim_ids).toEqual(["claim-1"]);
    expect(conflict.evidence_ids).toEqual([
      "evidence-source-1",
      "evidence-source-2",
    ]);
    expect(conflict.severity).toBe("material");
    expect(conflict.explanation).toBe(
      "The sources disagree about market demand.",
    );
  });
});

describe("ProvenanceGraph conflict preservation", () => {
  it("preserves decision conflicts in the provenance graph", () => {
    const conflict = {
      id: "conflict-1",
      claim_ids: ["claim-1"],
      evidence_ids: [
        "evidence-source-1",
        "evidence-source-2",
      ],
      severity: "material" as const,
      explanation: "The sources disagree about market demand.",
    };

    const graph = buildProvenanceGraphFromRankedSources(
      [],
      [],
      [],
      [conflict],
    );

    expect(graph.conflicts).toEqual([conflict]);
  });
});

describe("ProvenanceGraph conflict validation", () => {
  it("rejects conflicts that reference missing claims or evidence", () => {
    const graph = buildProvenanceGraphFromRankedSources(
      [],
      [],
      [],
      [
        {
          id: "conflict-1",
          claim_ids: ["claim-missing"],
          evidence_ids: ["evidence-missing"],
          severity: "material",
          explanation: "The conflict references unavailable provenance.",
        },
      ],
    );

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Decision conflict conflict-1 references missing claim claim-missing.",
    );
  });
});

describe("ProvenanceGraph conflict evidence validation", () => {
  it("rejects conflicts that reference missing evidence", () => {
    const graph = buildProvenanceGraphFromRankedSources(
      [],
      [
        {
          claimId: "claim-1",
          text: "Market demand is uncertain.",
          evidenceIds: [],
        },
      ],
      [],
      [
        {
          id: "conflict-1",
          claim_ids: ["claim-1"],
          evidence_ids: ["evidence-missing"],
          severity: "material",
          explanation: "The conflict references unavailable evidence.",
        },
      ],
    );

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Decision conflict conflict-1 references missing evidence evidence-missing.",
    );
  });
});

describe("ProvenanceGraph conflict lineage", () => {
  it("preserves conflicts spanning multiple claims and evidence items", () => {
    const graph = buildProvenanceGraphFromRankedSources(
      [
        {
          title: "Source One",
          content: "Demand is increasing.",
          url: "https://example.com/one",
          score: 0.9,
          authority: {
            score: 90,
            type: "primary",
          },
          relevance_score: 90,
          directness_score: 90,
          evidence_score: 90,
        },
        {
          title: "Source Two",
          content: "Demand is declining.",
          url: "https://example.com/two",
          score: 0.8,
          authority: {
            score: 80,
            type: "secondary",
          },
          relevance_score: 80,
          directness_score: 80,
          evidence_score: 80,
        },
      ],
      [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-source-1"],
        },
        {
          claimId: "claim-2",
          text: "Demand is declining.",
          evidenceIds: ["evidence-source-2"],
        },
      ],
      [],
      [
        {
          id: "conflict-1",
          claim_ids: ["claim-1", "claim-2"],
          evidence_ids: [
            "evidence-source-1",
            "evidence-source-2",
          ],
          severity: "material",
          explanation: "The sources disagree about demand direction.",
        },
      ],
    );

    expect(() => validateProvenanceGraph(graph)).not.toThrow();
    expect(graph.conflicts).toEqual([
      {
        id: "conflict-1",
        claim_ids: ["claim-1", "claim-2"],
        evidence_ids: [
          "evidence-source-1",
          "evidence-source-2",
        ],
        severity: "material",
        explanation: "The sources disagree about demand direction.",
      },
    ]);
  });
});

describe("Evidence coverage conflict semantics", () => {
  it("does not treat contradictory evidence alone as grounded support", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Contradictory Source",
          url: "https://example.com/source",
          authorityType: "secondary",
          authorityScore: 80,
          rankingScore: 80,
          evidenceScore: 80,
        }),
      ],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "Demand is declining.",
          polarity: "contradicts",
          type: "fact",
          strength: 80,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-1"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-1",
          relationship: "contradicts",
          relevance: 90,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage mixed conflict semantics", () => {
  it("counts a claim as grounded when support exists alongside contradictory evidence", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Supporting Source",
          url: "https://example.com/support",
          authorityType: "primary",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        }),
        buildEvidenceProvenance({
          sourceId: "source-2",
          title: "Contradictory Source",
          url: "https://example.com/contradict",
          authorityType: "secondary",
          authorityScore: 80,
          rankingScore: 80,
          evidenceScore: 80,
        }),
      ],
      evidence: [
        {
          id: "evidence-support",
          source_id: "source-1",
          claim: "Demand is increasing.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
        {
          id: "evidence-contradict",
          source_id: "source-2",
          claim: "Demand is declining.",
          polarity: "contradicts",
          type: "fact",
          strength: 80,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: [
            "evidence-support",
            "evidence-contradict",
          ],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-support",
          relationship: "supports",
          relevance: 95,
        },
        {
          claimId: "claim-1",
          evidenceId: "evidence-contradict",
          relationship: "contradicts",
          relevance: 90,
        },
      ],
      conflicts: [
        {
          id: "conflict-1",
          claim_ids: ["claim-1"],
          evidence_ids: [
            "evidence-support",
            "evidence-contradict",
          ],
          severity: "material",
          explanation: "The sources disagree about demand direction.",
        },
      ],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 1,
      coverage: 1,
      status: "fully_grounded",
    });
  });
});

describe("Evidence coverage context semantics", () => {
  it("does not treat context evidence alone as grounded support", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Context Source",
          url: "https://example.com/context",
          authorityType: "secondary",
          authorityScore: 80,
          rankingScore: 80,
          evidenceScore: 80,
        }),
      ],
      evidence: [
        {
          id: "evidence-context",
          source_id: "source-1",
          claim: "The market is undergoing seasonal changes.",
          polarity: "neutral",
          type: "context",
          strength: 70,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-context"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-context",
          relationship: "context",
          relevance: 80,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage invalid provenance semantics", () => {
  it("does not count a claim with a missing evidence reference as grounded", () => {
    const graph: ProvenanceGraph = {
      sources: [],
      evidence: [],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-missing"],
        },
      ],
      links: [],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage partial grounding semantics", () => {
  it("reports partial coverage when only some claims have supporting evidence", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Supporting Source",
          url: "https://example.com/support",
          authorityType: "primary",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        }),
      ],
      evidence: [
        {
          id: "evidence-support",
          source_id: "source-1",
          claim: "Demand is increasing.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-support"],
        },
        {
          claimId: "claim-2",
          text: "Customer retention will improve.",
          evidenceIds: [],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-support",
          relationship: "supports",
          relevance: 95,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 2,
      groundedClaims: 1,
      coverage: 0.5,
      status: "partially_grounded",
    });
  });
});

describe("Evidence coverage strength semantics", () => {
  it("does not treat zero-strength supporting evidence as grounded", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Weak Source",
          url: "https://example.com/weak",
          authorityType: "secondary",
          authorityScore: 10,
          rankingScore: 10,
          evidenceScore: 0,
        }),
      ],
      evidence: [
        {
          id: "evidence-weak",
          source_id: "source-1",
          claim: "Demand is increasing.",
          polarity: "supporting",
          type: "fact",
          strength: 0,
          verification: "unverified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-weak"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-weak",
          relationship: "supports",
          relevance: 10,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage negative strength semantics", () => {
  it("does not treat negative-strength supporting evidence as grounded", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Invalid Strength Source",
          url: "https://example.com/invalid",
          authorityType: "secondary",
          authorityScore: 10,
          rankingScore: 10,
          evidenceScore: -10,
        }),
      ],
      evidence: [
        {
          id: "evidence-invalid",
          source_id: "source-1",
          claim: "Demand is increasing.",
          polarity: "supporting",
          type: "fact",
          strength: -10,
          verification: "unverified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-invalid"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-invalid",
          relationship: "supports",
          relevance: 0,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage verification semantics", () => {
  it("does not treat unverified supporting evidence as grounded", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Unverified Source",
          url: "https://example.com/unverified",
          authorityType: "secondary",
          authorityScore: 70,
          rankingScore: 70,
          evidenceScore: 70,
        }),
      ],
      evidence: [
        {
          id: "evidence-unverified",
          source_id: "source-1",
          claim: "Demand is increasing.",
          polarity: "supporting",
          type: "fact",
          strength: 70,
          verification: "unverified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-unverified"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-unverified",
          relationship: "supports",
          relevance: 70,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("Evidence coverage verified contradiction semantics", () => {
  it("does not treat verified contradictory evidence as grounded", () => {
    const graph: ProvenanceGraph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Verified Contradictory Source",
          url: "https://example.com/contradictory",
          authorityType: "primary",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        }),
      ],
      evidence: [
        {
          id: "evidence-contradict",
          source_id: "source-1",
          claim: "Demand is declining.",
          polarity: "contradicts",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "Demand is increasing.",
          evidenceIds: ["evidence-contradict"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-contradict",
          relationship: "contradicts",
          relevance: 95,
        },
      ],
      conflicts: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });
});

describe("ProvenanceGraph validation", () => {
  it("reports fully grounded coverage when every claim has evidence", () => {
    const graph = {
      sources: [],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
        {
          id: "evidence-2",
          source_id: "source-2",
          claim: "The policy took effect immediately.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-1"],
        },
        {
          claimId: "claim-2",
          text: "The policy took effect immediately.",
          evidenceIds: ["evidence-2"],
        },
      ],
      links: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 2,
      groundedClaims: 2,
      coverage: 1,
      status: "fully_grounded",
    });
  });



  it("reports partial coverage when only some claims have evidence", () => {
    const graph = {
      sources: [],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-1"],
        },
        {
          claimId: "claim-2",
          text: "The policy reduced costs.",
          evidenceIds: [],
        },
      ],
      links: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 2,
      groundedClaims: 1,
      coverage: 0.5,
      status: "partially_grounded",
    });
  });



  it("reports unsupported coverage when no claims have evidence", () => {
    const graph = {
      sources: [],
      evidence: [],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: [],
        },
        {
          claimId: "claim-2",
          text: "The policy reduced costs.",
          evidenceIds: [],
        },
      ],
      links: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 2,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });



  it("does not count claims with only missing evidence IDs as grounded", () => {
    const graph = {
      sources: [],
      evidence: [],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-missing"],
        },
      ],
      links: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 1,
      groundedClaims: 0,
      coverage: 0,
      status: "unsupported",
    });
  });

  it("reports no-claims coverage for an empty provenance graph", () => {
    const graph = {
      sources: [],
      evidence: [],
      claims: [],
      links: [],
    };

    expect(calculateEvidenceCoverage(graph)).toEqual({
      totalClaims: 0,
      groundedClaims: 0,
      coverage: 0,
      status: "no_claims",
    });
  });

  it("accepts an explicitly empty provenance graph", () => {
    const graph = {
      sources: [],
      evidence: [],
      claims: [],
      links: [],
    };

    expect(() => validateProvenanceGraph(graph)).not.toThrow();
  });

  it("rejects a claim that references missing evidence", () => {
    const graph = {
      sources: [],
      evidence: [],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-missing"],
        },
      ],
      links: [],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim claim-1 references missing evidence evidence-missing.",
    );
  });


  it("rejects a link that references an unknown claim", () => {
    const graph = {
      sources: [
        {
          sourceId: "source-1",
          sourceTitle: "Example Source",
          sourceUrl: "https://example.com",
          sourceDomain: "example.com",
          authorityType: "official",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        },
      ],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-1"],
        },
      ],
      links: [
        {
          claimId: "claim-missing",
          evidenceId: "evidence-1",
          relationship: "supports",
          relevance: 90,
        },
      ],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim evidence link references missing claim claim-missing.",
    );
  });



  it("rejects a link that references unknown evidence", () => {
    const graph = {
      sources: [
        {
          sourceId: "source-1",
          sourceTitle: "Example Source",
          sourceUrl: "https://example.com",
          sourceDomain: "example.com",
          authorityType: "official",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        },
      ],
      evidence: [],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: [],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-missing",
          relationship: "supports",
          relevance: 90,
        },
      ],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim evidence link references missing evidence evidence-missing.",
    );
  });


  it("rejects a link with an invalid relationship", () => {
    const graph = {
      sources: [
        {
          sourceId: "source-1",
          sourceTitle: "Example Source",
          sourceUrl: "https://example.com",
          sourceDomain: "example.com",
          authorityType: "official",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        },
      ],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-1"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-1",
          relationship: "invalid",
          relevance: 90,
        },
      ],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim claim-1 has an invalid evidence relationship.",
    );
  });


  it("rejects a link with relevance outside 0-100", () => {
    const graph = {
      sources: [
        {
          sourceId: "source-1",
          sourceTitle: "Example Source",
          sourceUrl: "https://example.com",
          sourceDomain: "example.com",
          authorityType: "official",
          authorityScore: 90,
          rankingScore: 90,
          evidenceScore: 90,
        },
      ],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-1",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 90,
          verification: "verified",
        },
      ],
      claims: [
        {
          claimId: "claim-1",
          text: "The policy was approved.",
          evidenceIds: ["evidence-1"],
        },
      ],
      links: [
        {
          claimId: "claim-1",
          evidenceId: "evidence-1",
          relationship: "supports",
          relevance: 101,
        },
      ],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Claim claim-1 has evidence relevance outside 0-100.",
    );
  });
  it("rejects evidence that references an unknown source", () => {
    const graph = {
      sources: [
        buildEvidenceProvenance({
          sourceId: "source-1",
          title: "Official report",
          url: "https://example.com/report",
          authorityType: "official",
          authorityScore: 95,
          rankingScore: 90,
          evidenceScore: 88,
        }),
      ],
      evidence: [
        {
          id: "evidence-1",
          source_id: "source-missing",
          claim: "The policy was approved.",
          polarity: "supporting",
          type: "fact",
          strength: 85,
          verification: "verified",
        },
      ],
      claims: [],
      links: [],
    };

    expect(() => validateProvenanceGraph(graph)).toThrow(
      "Evidence evidence-1 references missing source source-missing.",
    );
  });
});

describe("research pipeline provenance integration", () => {
  it("maps ranked research sources to stable source and evidence provenance", () => {
    const rankedSources = [
      {
        title: "Official Report",
        content: "The policy reduced costs.",
        url: "https://example.gov/report",
        score: 0.91,
        authority: {
          score: 95,
          type: "government",
        },
        relevance_score: 90,
        directness_score: 85,
        evidence_score: 92,
      },
      {
        title: "Independent Analysis",
        content: "The policy had limited cost impact.",
        url: "https://example.org/analysis",
        score: 0.82,
        authority: {
          score: 80,
          type: "research",
        },
        relevance_score: 85,
        directness_score: 80,
        evidence_score: 78,
      },
    ];

    const graph = buildProvenanceGraphFromRankedSources(rankedSources);

    expect(graph.sources.map((source) => source.sourceId)).toEqual([
      "source-1",
      "source-2",
    ]);

    expect(graph.evidence.map((evidence) => evidence.source_id)).toEqual([
      "source-1",
      "source-2",
    ]);

    expect(graph.evidence.map((evidence) => evidence.id)).toEqual([
      "evidence-source-1",
      "evidence-source-2",
    ]);

    expect(graph.sources[0]).toMatchObject({
      sourceDomain: "example.gov",
      authorityType: "government",
      authorityScore: 95,
      evidenceScore: 92,
    });
  });
});

describe("research result provenance integration", () => {
  it("builds provenance from the exact source IDs exposed by the research result", () => {
    const rankedSources = [
      {
        title: "Government Report",
        content: "The policy reduced costs.",
        url: "https://example.gov/report",
        score: 0.91,
        authority: {
          score: 95,
          type: "government",
        },
        relevance_score: 90,
        directness_score: 85,
        evidence_score: 92,
      },
    ];

    const result = buildResearchResultProvenance(rankedSources);

    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].sourceId).toBe("source-1");

    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].source_id).toBe("source-1");
    expect(result.evidence[0].id).toBe("evidence-source-1");
  });
});

describe("research result claim provenance integration", () => {
  it("grounds a research claim against the evidence generated from the ranked source", () => {
    const rankedSources = [
      {
        title: "Government Report",
        content: "The policy reduced costs.",
        url: "https://example.gov/report",
        score: 0.91,
        authority: {
          score: 95,
          type: "government",
        },
        relevance_score: 90,
        directness_score: 85,
        evidence_score: 92,
      },
    ];

    const result = buildResearchResultProvenance(
      rankedSources,
      [
        {
          claimId: "claim-1",
          text: "The policy reduced costs.",
          evidenceIds: ["evidence-source-1"],
        },
      ],
      [
        {
          claimId: "claim-1",
          evidenceId: "evidence-source-1",
          relationship: "supports",
          relevance: 95,
        },
      ],
    );

    expect(result.claims).toEqual([
      {
        claimId: "claim-1",
        text: "The policy reduced costs.",
        evidenceIds: ["evidence-source-1"],
      },
    ]);

    expect(result.links).toEqual([
      {
        claimId: "claim-1",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 95,
      },
    ]);

    expect(result.evidence[0].source_id).toBe("source-1");
  });
});

describe("research synthesis claim grounding", () => {
  it("grounds a synthesized source reference to the matching provenance evidence", () => {
    const rankedSources = [
      {
        title: "Government Report",
        content: "The policy reduced costs.",
        url: "https://example.gov/report",
        score: 0.91,
        authority: {
          score: 95,
          type: "government",
        },
        relevance_score: 90,
        directness_score: 85,
        evidence_score: 92,
      },
    ];

    const result = buildResearchResultProvenance(rankedSources);

    const claim = buildGroundedClaim(
      "claim-1",
      "The policy reduced costs.",
      [result.evidence[0].id],
      new Set(result.evidence.map((evidence) => evidence.id)),
    );

    const link = buildClaimEvidenceLink(
      claim.claimId,
      result.evidence[0].id,
      "supports",
      95,
    );

    result.claims.push(claim);
    result.links.push(link);

    validateProvenanceGraph(result);

    expect(result.claims[0].evidenceIds).toEqual([
      "evidence-source-1",
    ]);

    expect(result.links[0]).toEqual({
      claimId: "claim-1",
      evidenceId: "evidence-source-1",
      relationship: "supports",
      relevance: 95,
    });
  });
});

describe("research analysis provenance adapter", () => {
  it("converts source-numbered analysis evidence into atomic grounded claims", () => {
    const rankedSources = [
      {
        title: "Government Report",
        content: "The policy reduced costs.",
        url: "https://example.gov/report",
        score: 0.91,
        authority: {
          score: 95,
          type: "government",
        },
        relevance_score: 90,
        directness_score: 85,
        evidence_score: 92,
      },
      {
        title: "Independent Analysis",
        content: "The policy had limited cost impact.",
        url: "https://example.org/analysis",
        score: 0.82,
        authority: {
          score: 80,
          type: "research",
        },
        relevance_score: 85,
        directness_score: 80,
        evidence_score: 78,
      },
    ];

    const graph = buildResearchResultProvenance(rankedSources);

    const analysis = {
      key_facts: [
        {
          fact: "The policy reduced costs.",
          sources: [1],
        },
      ],
      evidence_for: [
        {
          point: "Government data supports cost reduction.",
          sources: [1],
        },
      ],
      evidence_against: [
        {
          point: "Independent analysis reports limited impact.",
          sources: [2],
        },
      ],
    };

    const grounded = buildGroundedClaimsFromResearchAnalysis(
      analysis,
      graph,
    );

    expect(grounded.claims).toEqual([
      {
        claimId: "claim-1",
        text: "The policy reduced costs.",
        evidenceIds: ["evidence-source-1"],
      },
      {
        claimId: "claim-2",
        text: "Government data supports cost reduction.",
        evidenceIds: ["evidence-source-1"],
      },
      {
        claimId: "claim-3",
        text: "Independent analysis reports limited impact.",
        evidenceIds: ["evidence-source-2"],
      },
    ]);

    expect(grounded.links).toEqual([
      {
        claimId: "claim-1",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 100,
      },
      {
        claimId: "claim-2",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 100,
      },
      {
        claimId: "claim-3",
        evidenceId: "evidence-source-2",
        relationship: "contradicts",
        relevance: 100,
      },
    ]);
  });
});

describe("research analysis provenance validation", () => {
  it("rejects a claim that references a missing source", () => {
    const graph = buildResearchResultProvenance([
      {
        title: "Source One",
        content: "Available evidence",
        url: "https://example.com/one",
        score: 91,
        authority: { score: 90, type: "primary" },
        relevance_score: 92,
        directness_score: 88,
        evidence_score: 89,
      },
    ]);

    expect(() =>
      buildGroundedClaimsFromResearchAnalysis(
        {
          key_facts: [
            {
              fact: "This claim references an unavailable source.",
              sources: [2],
            },
          ],
        },
        graph,
      ),
    ).toThrow("Claim references missing evidence evidence-source-2.");
  });
});

describe("research analysis provenance integration", () => {
  it("grounds key facts and preserves supporting and contradicting source links", () => {
    const graph = buildResearchResultProvenance([
      {
        title: "Source One",
        content: "Supporting evidence",
        url: "https://example.com/one",
        score: 91,
        authority: { score: 90, type: "primary" },
        relevance_score: 92,
        directness_score: 88,
        evidence_score: 89,
      },
      {
        title: "Source Two",
        content: "Contradicting evidence",
        url: "https://example.com/two",
        score: 84,
        authority: { score: 80, type: "secondary" },
        relevance_score: 85,
        directness_score: 82,
        evidence_score: 81,
      },
    ]);

    const grounded = buildGroundedClaimsFromResearchAnalysis(
      {
        key_facts: [
          {
            fact: "The decision has material supporting evidence.",
            sources: [1],
          },
        ],
        evidence_for: [
          {
            point: "Source One supports the decision.",
            sources: [1],
          },
        ],
        evidence_against: [
          {
            point: "Source Two contradicts the decision.",
            sources: [2],
          },
        ],
      },
      graph,
    );

    expect(grounded.claims).toHaveLength(3);
    expect(grounded.links).toEqual([
      {
        claimId: "claim-1",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 100,
      },
      {
        claimId: "claim-2",
        evidenceId: "evidence-source-1",
        relationship: "supports",
        relevance: 100,
      },
      {
        claimId: "claim-3",
        evidenceId: "evidence-source-2",
        relationship: "contradicts",
        relevance: 100,
      },
    ]);
  });
});
