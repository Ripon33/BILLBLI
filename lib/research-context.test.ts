import { describe, expect, it } from "vitest";
import { buildResearchPlan } from "./research";
import { extractDecisionContext } from "./decision-context";

describe("research context integration", () => {
  it("carries decision context into the research plan", () => {
    const question =
      "Should I open a coffee shop in Cox's Bazar with ৳10 lakh within 6 months?";

    const context = extractDecisionContext(question);
    const plan = buildResearchPlan(question, context);

    expect(plan).toMatchObject({
      question,
      context: {
        objective: "open a coffee shop",
        location: "Cox's Bazar",
        budget: "৳10 lakh",
        timeframe: "6 months",
      },
    });
  });
});
