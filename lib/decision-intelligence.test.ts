import { describe, expect, it } from "vitest";
import {
  clampScore,
  validateFactorWeights,
  validateEvidenceReferences,
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
