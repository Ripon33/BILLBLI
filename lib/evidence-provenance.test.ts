import { describe, expect, it } from "vitest";
import {
  buildEvidenceProvenance,
  buildEvidenceProvenanceFromRankedSource,
  validateClaimEvidenceLinks,
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