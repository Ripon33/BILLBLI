import { describe, expect, it } from "vitest";
import { rankEvidenceSources } from "./evidence-ranking";

describe("evidence source ranking", () => {
  it("keeps a relevant source when its wording differs from the question", () => {
    const question =
      "Should I start a coffee shop in Cox's Bazar?";

    const sources = [
      {
        title: "Cox's Bazar tourism market and food service opportunities",
        content:
          "The destination attracts large numbers of visitors and has growing demand for restaurants, cafes, accommodation, and other food-service businesses.",
        url: "https://example.com/cox-bazar-tourism",
        score: 0.8,
      },
    ];

    const ranked = rankEvidenceSources(question, sources);

    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].evidence_score).toBeGreaterThanOrEqual(65);
  });
});

  it("prefers authoritative sources when relevance is comparable", () => {
    const question = "What are the tourism market conditions?";

    const sources = [
      {
        title: "Tourism market report",
        content:
          "Official tourism statistics and market data describe visitor numbers, tourism demand, and market conditions.",
        url: "https://example.gov/tourism-report",
        score: 0.8,
      },
      {
        title: "Tourism market report",
        content:
          "Tourism statistics and market data describe visitor numbers and tourism demand.",
        url: "https://example.com/tourism-report",
        score: 0.8,
      },
    ];

    const ranked = rankEvidenceSources(question, sources);

    expect(ranked.length).toBe(2);
    expect(ranked[0].url).toBe("https://example.gov/tourism-report");
  });

  it("rejects weak generic sources unless their evidence is unusually strong", () => {
    const question = "Should I open a restaurant?";

    const sources = [
      {
        title: "Best restaurant ideas",
        content: "Here are some general ideas for starting a restaurant.",
        url: "https://example.com/restaurant-ideas",
        score: 0.3,
      },
    ];

    const ranked = rankEvidenceSources(question, sources);


    expect(ranked).toHaveLength(0);
  });

  it("limits the evidence set to two sources per domain", () => {
    const question = "Tourism market research";

    const sources = Array.from({ length: 3 }, (_, index) => ({
      title: `Tourism market report ${index + 1}`,
      content:
        "Tourism market statistics, visitor demand, research, and analysis.",
      url: `https://example.com/report-${index + 1}`,
      score: 0.9,
    }));

    const ranked = rankEvidenceSources(question, sources);

    expect(ranked).toHaveLength(2);
  });
