import { describe, expect, it } from "vitest";

describe("multilingual source relevance", () => {
  it("keeps Bangla question terms available for relevance matching", () => {
    const question = "কক্সবাজারে কফি শপ শুরু করা উচিত";

    const source = {
      url: "https://example.com/coxsbazar-coffee",
      title: "কক্সবাজারে কফি শপ ব্যবসার বাজার",
      content:
        "কক্সবাজারে কফি শপের চাহিদা, পর্যটন এবং ব্যবসার সম্ভাবনা নিয়ে তথ্য।",
      score: 0.9,
    };

    const tokenize = (value: string) =>
      value
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/\s+/)
        .map((word) => word.replace(/^-+|-+$/g, ""))
        .filter((word) => word.length >= 2);

    const questionTerms = Array.from(new Set(tokenize(question)));
    const sourceTerms = new Set(
      tokenize(`${source.title} ${source.content}`)
    );

    const matches = questionTerms.filter((term) =>
      sourceTerms.has(term)
    );

    expect(questionTerms.length).toBeGreaterThan(0);
    expect(matches.length).toBeGreaterThan(0);
  });
});
