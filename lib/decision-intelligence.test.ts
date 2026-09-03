import { describe, expect, it } from "vitest";
import {
  clampScore,
  validateFactorWeights,
  validateEvidenceReferences,
  extractStructuredEvidence,
  extractClaims,
  scoreEvidence,
  calculateDecisionScore,
} from "./decision-intelligence";

describe("decision intelligence domain model", () => {
  it("clamps scores to the 0-100 range", () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(120)).toBe(100);
  });

  it("accepts factor weights that total 100", () => {
    expect(
      validateFactorWeights([
        { name: "Market / Demand", weight: 25 },
        { name: "Economics / ROI", weight: 20 },
        { name: "Feasibility", weight: 15 },
        { name: "Competition", weight: 10 },
        { name: "Risk", weight: 15 },
        { name: "Regulation / Constraints", weight: 15 },
      ]),
    ).toBe(true);
  });

  it("rejects factor weights that do not total 100", () => {
    expect(
      validateFactorWeights([
        { name: "Market / Demand", weight: 25 },
        { name: "Economics / ROI", weight: 20 },
      ]),
    ).toBe(false);
  });
});

describe("decision intelligence references", () => {
  it("validates that evidence references known sources", () => {
    const sources = [{ id: "source-1" }, { id: "source-2" }];

    const evidence = [
      {
        id: "evidence-1",
        source_id: "source-1",
        claim: "Example claim",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 80,
        verification: "verified" as const,
      },
    ];

    expect(
      evidence.every((item) =>
        sources.some((source) => source.id === item.source_id),
      ),
    ).toBe(true);
  });

  it("detects evidence that references an unknown source", () => {
    const sources = [{ id: "source-1" }];

    const evidence = [
      {
        id: "evidence-1",
        source_id: "missing-source",
        claim: "Example claim",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 80,
        verification: "verified" as const,
      },
    ];

    expect(
      evidence.every((item) =>
        sources.some((source) => source.id === item.source_id),
      ),
    ).toBe(false);
  });
});

describe("evidence reference validation", () => {
  it("returns true when every evidence item references a known source", () => {
    const sources = [{ id: "source-1" }, { id: "source-2" }];

    const evidence = [
      {
        id: "evidence-1",
        source_id: "source-1",
        claim: "Example claim",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 80,
        verification: "verified" as const,
      },
    ];

    expect(validateEvidenceReferences(evidence, sources)).toBe(true);
  });

  it("returns false when evidence references an unknown source", () => {
    const sources = [{ id: "source-1" }];

    const evidence = [
      {
        id: "evidence-1",
        source_id: "missing-source",
        claim: "Example claim",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 80,
        verification: "verified" as const,
      },
    ];

    expect(validateEvidenceReferences(evidence, sources)).toBe(false);
  });
});

describe("structured evidence extraction", () => {
  it("extracts supporting evidence from a source", () => {
    const evidence = extractStructuredEvidence([
      {
        id: "source-1",
        text: "The market grew by 20% in 2025.",
      },
    ]);

    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({
      source_id: "source-1",
      claim: "The market grew by 20% in 2025.",
      polarity: "supporting",
      type: "fact",
    });
  });

  it("extracts opposing evidence", () => {
    const evidence = extractStructuredEvidence([
      {
        id: "source-2",
        text: "The market declined by 10% in 2025.",
      },
    ]);

    expect(evidence[0]).toMatchObject({
      source_id: "source-2",
      polarity: "against",
      type: "fact",
    });
  });

  it("classifies forecasts separately from facts", () => {
    const evidence = extractStructuredEvidence([
      {
        id: "source-3",
        text: "Analysts forecast that demand will increase next year.",
      },
    ]);

    expect(evidence[0]).toMatchObject({
      source_id: "source-3",
      type: "forecast",
    });
  });

  it("preserves source references", () => {
    const evidence = extractStructuredEvidence([
      {
        id: "source-7",
        text: "Customers are increasingly adopting the product.",
      },
    ]);

    expect(evidence[0].source_id).toBe("source-7");
  });

  it("returns no evidence for empty source material", () => {
    expect(
      extractStructuredEvidence([
        {
          id: "source-empty",
          text: "",
        },
      ]),
    ).toEqual([]);
  });
});

describe("claim extraction", () => {
  it("creates a claim from evidence", () => {
    const evidence = [{
      id: "evidence-1",
      source_id: "source-1",
      claim: "The market grew by 20% in 2025.",
      polarity: "supporting" as const,
      type: "fact" as const,
      strength: 80,
      verification: "verified" as const,
    }];

    const claims = extractClaims(evidence);

    expect(claims).toHaveLength(1);
    expect(claims[0]).toMatchObject({
      statement: "The market grew by 20% in 2025.",
      type: "fact",
      evidence_ids: ["evidence-1"],
    });
  });

  it("groups evidence supporting the same claim", () => {
    const evidence = [
      {
        id: "evidence-1",
        source_id: "source-1",
        claim: "Demand is increasing.",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 80,
        verification: "verified" as const,
      },
      {
        id: "evidence-2",
        source_id: "source-2",
        claim: "Demand is increasing.",
        polarity: "supporting" as const,
        type: "fact" as const,
        strength: 70,
        verification: "corroborated" as const,
      },
    ];

    const claims = extractClaims(evidence);

    expect(claims).toHaveLength(1);
    expect(claims[0].evidence_ids).toEqual([
      "evidence-1",
      "evidence-2",
    ]);
  });

  it("calculates claim confidence from supporting evidence", () => {
    const evidence = [{
      id: "evidence-1",
      source_id: "source-1",
      claim: "The market is growing.",
      polarity: "supporting" as const,
      type: "fact" as const,
      strength: 90,
      verification: "verified" as const,
    }];

    const claims = extractClaims(evidence);

    expect(claims[0].confidence).toBe(90);
  });
});

describe("evidence scoring", () => {
  it("scores verified high-quality evidence higher than weak evidence", () => {
    const strong = scoreEvidence({
      authority: 95,
      relevance: 95,
      directness: 90,
      freshness: 90,
      corroboration: 85,
    });

    const weak = scoreEvidence({
      authority: 30,
      relevance: 40,
      directness: 35,
      freshness: 30,
      corroboration: 20,
    });

    expect(strong).toBeGreaterThan(weak);
  });

  it("returns a normalized score between 0 and 100", () => {
    expect(
      scoreEvidence({
        authority: 100,
        relevance: 100,
        directness: 100,
        freshness: 100,
        corroboration: 100,
      }),
    ).toBe(100);

    expect(
      scoreEvidence({
        authority: 0,
        relevance: 0,
        directness: 0,
        freshness: 0,
        corroboration: 0,
      }),
    ).toBe(0);
  });

  it("increases evidence strength when corroborated", () => {
    const singleSource = scoreEvidence({
      authority: 80,
      relevance: 80,
      directness: 80,
      freshness: 80,
      corroboration: 20,
    });

    const corroborated = scoreEvidence({
      authority: 80,
      relevance: 80,
      directness: 80,
      freshness: 80,
      corroboration: 90,
    });

    expect(corroborated).toBeGreaterThan(singleSource);
  });
});

describe("decision factor scoring", () => {
  it("calculates the weighted decision score", () => {
    const factors = [
      { name: "Market / Demand", score: 80, weight: 25 },
      { name: "Economics / ROI", score: 70, weight: 20 },
      { name: "Feasibility", score: 60, weight: 15 },
      { name: "Competition", score: 50, weight: 10 },
      { name: "Risk", score: 40, weight: 15 },
      { name: "Regulation / Constraints", score: 30, weight: 15 },
    ];

    expect(calculateDecisionScore(factors)).toBe(59);
  });

  it("requires factor weights to total 100", () => {
    expect(() =>
      calculateDecisionScore([
        { name: "Market / Demand", score: 80, weight: 50 },
        { name: "Economics / ROI", score: 70, weight: 30 },
      ]),
    ).toThrow();
  });

  it("clamps factor scores before calculating", () => {
    const factors = [
      { name: "Market / Demand", score: 120, weight: 25 },
      { name: "Economics / ROI", score: 70, weight: 20 },
      { name: "Feasibility", score: 60, weight: 15 },
      { name: "Competition", score: 50, weight: 10 },
      { name: "Risk", score: 40, weight: 15 },
      { name: "Regulation / Constraints", score: -20, weight: 15 },
    ];

    expect(calculateDecisionScore(factors)).toBe(59);
  });
});
