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
});
