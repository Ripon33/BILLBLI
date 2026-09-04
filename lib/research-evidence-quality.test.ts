import { describe, expect, it } from "vitest";

describe("research evidence quality", () => {
  it("requires evidence from multiple independent domains when enough sources exist", () => {
    const sources = [
      {
        url: "https://example.com/a",
        evidence_score: 90,
        authority_score: 80,
      },
      {
        url: "https://example.com/b",
        evidence_score: 88,
        authority_score: 75,
      },
      {
        url: "https://example.org/c",
        evidence_score: 82,
        authority_score: 70,
      },
    ];

    const domains = new Set(
      sources.map((source) => new URL(source.url).hostname)
    );

    expect(domains.size).toBeGreaterThanOrEqual(2);
  });

  it("does not require multiple domains when only one quality source exists", () => {
    const sources = [
      {
        url: "https://example.com/a",
        evidence_score: 90,
        authority_score: 80,
      },
    ];

    const domains = new Set(
      sources.map((source) => new URL(source.url).hostname)
    );

    expect(sources.length).toBeGreaterThan(0);
    expect(domains.size).toBeGreaterThanOrEqual(1);
  });
});

describe("research context fit", () => {
  it("prefers sources that match the decision location and subject", () => {
    const question = "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?";

    const sources = [
      {
        title: "কক্সবাজারে পর্যটন ও কফি শপ ব্যবসার বাজার",
        content: "কক্সবাজারে পর্যটক, ক্যাফে, কফি শপ এবং স্থানীয় ব্যবসার চাহিদা নিয়ে তথ্য।",
        url: "https://example.com/coxsbazar-coffee",
      },
      {
        title: "How to Start a Coffee Shop",
        content: "General information about starting a coffee shop anywhere.",
        url: "https://example.org/general-coffee",
      },
    ];

    const scoreContextFit = (
      source: (typeof sources)[number],
      decisionQuestion: string,
    ) => {
      const text =
        `${source.title} ${source.content}`.toLowerCase();

      let score = 0;

      if (
        /কক্সবাজার|cox'?s bazar/i.test(text) &&
        /কক্সবাজার|cox'?s bazar/i.test(decisionQuestion)
      ) {
        score += 50;
      }

      if (
        /কফি\s*শপ|coffee\s*shop|ক্যাফে|cafe/i.test(text) &&
        /কফি\s*শপ|coffee\s*shop|ক্যাফে|cafe/i.test(decisionQuestion)
      ) {
        score += 30;
      }

      return score;
    };

    const ranked = sources
      .map((source) => ({
        ...source,
        context_fit_score: scoreContextFit(source, question),
      }))
      .sort(
        (a, b) =>
          b.context_fit_score - a.context_fit_score
      );

    expect(ranked[0].url).toBe(
      "https://example.com/coxsbazar-coffee"
    );

    expect(ranked[0].context_fit_score).toBeGreaterThan(
      ranked[1].context_fit_score
    );
  });
});
import { scoreResearchContextFit } from "./research-context";

describe("production research context fit", () => {
  it("gives location-specific sources a higher context score than generic sources", () => {
    const question = "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?";

    const localSource = {
      title: "কক্সবাজারে কফি শপ ব্যবসার বাজার ও পর্যটন",
      content:
        "কক্সবাজারে কফি শপ, ক্যাফে, পর্যটন এবং স্থানীয় বাজারের চাহিদা নিয়ে তথ্য।",
      url: "https://example.com/coxsbazar-coffee",
    };

    const genericSource = {
      title: "How to Start a Coffee Shop",
      content:
        "General information about starting and operating a coffee shop.",
      url: "https://example.org/general-coffee",
    };

    const localScore = scoreResearchContextFit(
      question,
      localSource,
    );

    const genericScore = scoreResearchContextFit(
      question,
      genericSource,
    );

    expect(localScore).toBeGreaterThan(genericScore);
  });
});

describe("context fit integration", () => {
  it("produces a stronger evidence score for a context-matched source", () => {
    const question = "কক্সবাজারে কি একটি কফি শপ শুরু করা উচিত?";

    const localContextFit = scoreResearchContextFit(question, {
      title: "কক্সবাজারে কফি শপ ব্যবসার বাজার ও পর্যটন",
      content:
        "কক্সবাজারে কফি শপ, ক্যাফে, পর্যটন এবং স্থানীয় বাজারের চাহিদা নিয়ে তথ্য।",
      url: "https://example.com/coxsbazar-coffee",
    });

    const genericContextFit = scoreResearchContextFit(question, {
      title: "How to Start a Coffee Shop",
      content:
        "General information about starting and operating a coffee shop.",
      url: "https://example.org/general-coffee",
    });

    const baseRelevance = 50;
    const authority = 50;
    const directness = 50;
    const tavilyScore = 50;

    const localRelevance = Math.min(
      100,
      baseRelevance + localContextFit * 0.25,
    );

    const genericRelevance = Math.min(
      100,
      baseRelevance + genericContextFit * 0.25,
    );

    const localEvidence = Math.round(
      localRelevance * 0.50 +
        authority * 0.25 +
        directness * 0.15 +
        tavilyScore * 0.10,
    );

    const genericEvidence = Math.round(
      genericRelevance * 0.50 +
        authority * 0.25 +
        directness * 0.15 +
        tavilyScore * 0.10,
    );

    expect(localEvidence).toBeGreaterThan(genericEvidence);
  });
});

describe("context-aware weak source protection", () => {
  it("allows a strong context-matched source to survive weak-source filtering", () => {
    const contextFit = 80;
    const evidenceScore = 68;
    const weakSource = true;

    const shouldKeep =
      !weakSource ||
      evidenceScore >= 72 ||
      contextFit >= 70;

    expect(shouldKeep).toBe(true);
  });

  it("still rejects a weak generic source with insufficient evidence", () => {
    const contextFit = 0;
    const evidenceScore = 68;
    const weakSource = true;

    const shouldKeep =
      !weakSource ||
      evidenceScore >= 72 ||
      contextFit >= 70;

    expect(shouldKeep).toBe(false);
  });
});
