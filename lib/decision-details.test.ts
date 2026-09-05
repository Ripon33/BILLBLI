import { describe, expect, it } from "vitest";
import { getDecisionDetailItems } from "./decision-details";

describe("decision detail presentation", () => {
  it("returns available decision details without inventing missing values", () => {
    const result = getDecisionDetailItems({
      benefits: ["Strong local demand"],
      risks: ["Seasonal demand"],
      tradeoffs: ["Higher investment versus stronger quality"],
      decisionFactors: ["Budget: ৳10 lakh"],
    });

    expect(result).toEqual({
      benefits: ["Strong local demand"],
      risks: ["Seasonal demand"],
      tradeoffs: ["Higher investment versus stronger quality"],
      decisionFactors: ["Budget: ৳10 lakh"],
    });
  });

  it("returns empty lists when decision details are unavailable", () => {
    const result = getDecisionDetailItems({});

    expect(result).toEqual({
      benefits: [],
      risks: [],
      tradeoffs: [],
      decisionFactors: [],
    });
  });
});
