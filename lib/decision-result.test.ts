import { describe, expect, it } from "vitest";
import { getRecommendationLabel, getReassessmentItems } from "./decision-result";

describe("decision result presentation", () => {
  it("formats a conditional recommendation for the UI", () => {
    expect(getRecommendationLabel("conditional")).toBe("Conditional decision");
  });

  it("formats a proceed recommendation for the UI", () => {
    expect(getRecommendationLabel("proceed")).toBe("Proceed");
  });

  it("formats a do-not-proceed recommendation for the UI", () => {
    expect(getRecommendationLabel("do_not_proceed")).toBe("Do not proceed");
  });
  it("prefers reassessment guidance when available", () => {
    const result = getReassessmentItems(
      {
        reassessmentTriggers: ["Seasonal demand risk"],
        whatWouldChange: ["If demand changes materially, reassess the decision."],
      },
      ["Legacy analysis trigger"],
    );

    expect(result).toEqual([
      "If demand changes materially, reassess the decision.",
      "Seasonal demand risk",
    ]);
  });
});
