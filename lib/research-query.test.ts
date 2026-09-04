import { describe, expect, it } from "vitest";
import { buildResearchQueries } from "./research-query";

describe("multilingual research queries", () => {
  it("keeps the original question as a research query", () => {
    const queries = buildResearchQueries(
      "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?"
    );

    expect(queries).toContain(
      "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?"
    );
  });

  it("adds English research dimensions without replacing the original question", () => {
    const queries = buildResearchQueries(
      "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?"
    );

    expect(queries.some((query) =>
      query.includes("market demand")
    )).toBe(true);

    expect(queries.some((query) =>
      query.includes("competitors pricing")
    )).toBe(true);
  });

  it("supports English questions", () => {
    const queries = buildResearchQueries(
      "Should I start a coffee shop in Cox's Bazar?"
    );

    expect(queries).toContain(
      "Should I start a coffee shop in Cox's Bazar?"
    );
  });

  it("covers decision-critical research dimensions", () => {
    const queries = buildResearchQueries(
      "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?"
    );

    expect(queries.some((query) =>
      query.includes("local market demand")
    )).toBe(true);

    expect(queries.some((query) =>
      query.includes("competitors pricing")
    )).toBe(true);

    expect(queries.some((query) =>
      query.includes("startup costs profitability")
    )).toBe(true);

    expect(queries.some((query) =>
      query.includes("regulations licensing")
    )).toBe(true);

    expect(queries.some((query) =>
      query.includes("risks seasonality")
    )).toBe(true);
  });

});

describe("location-aware research queries", () => {
  it("adds location-focused English research queries for a location-specific decision", () => {
    const queries = buildResearchQueries(
      "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?"
    );

    expect(queries.some((query) =>
      /Cox'?s Bazar.*coffee shop.*market demand/i.test(query)
    )).toBe(true);

    expect(queries.some((query) =>
      /Cox'?s Bazar.*coffee shop.*competitors.*pricing/i.test(query)
    )).toBe(true);
  });
});
