import { describe, expect, it } from "vitest";
import { buildResearchQueries } from "./research-query";
import { extractDecisionContext } from "./decision-context";

describe("research query context", () => {
  it("uses supplied decision context when building research queries", () => {
    const question = "Should I open a coffee shop?";
    const context = extractDecisionContext(
      "Should I open a coffee shop in Cox's Bazar with ৳10 lakh within 6 months?"
    );

    const queries = buildResearchQueries(question, context);

    expect(
      queries.some(
        (query) =>
          query.includes("Cox's Bazar") &&
          query.includes("৳10 lakh") &&
          query.includes("6 months")
      )
    ).toBe(true);
  });
});
