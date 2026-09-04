import { describe, expect, it } from "vitest";
import { extractDecisionContext } from "./decision-context";

describe("decision context", () => {
  it("extracts objective, location, budget, and timeframe", () => {
    const result = extractDecisionContext(
      "Should I open a coffee shop in Cox's Bazar with ৳10 lakh within 6 months?"
    );

    expect(result).toMatchObject({
      objective: "open a coffee shop",
      location: "Cox's Bazar",
      budget: "৳10 lakh",
      timeframe: "6 months",
    });
  });

  it("does not invent missing context", () => {
    const result = extractDecisionContext(
      "Should I open a coffee shop in Cox's Bazar?"
    );

    expect(result.location).toBe("Cox's Bazar");
    expect(result.objective).toBe("open a coffee shop");
    expect(result.budget).toBeNull();
    expect(result.timeframe).toBeNull();
  });
});
