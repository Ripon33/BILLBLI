import { describe, expect, it } from "vitest";
import {
  getResearchShareContent,
  getStudyShareContent,
} from "./result-share-content";

describe("result share content", () => {
  it("formats Research content with the question and available analysis", () => {
    const content = getResearchShareContent("Should I invest?", {
      analysis: {
        decision: "Proceed",
        confidence: 82,
        summary: "The evidence is favorable.",
      },
    });

    expect(content).toContain("Should I invest?");
    expect(content).toContain("Proceed");
    expect(content).toContain("82");
    expect(content).toContain("The evidence is favorable.");
  });

  it("includes Research recommendation details when available", () => {
    const content = getResearchShareContent("Should I launch?", {
      recommendation: {
        recommendation: "proceed",
        confidence: 91,
        why: ["Strong demand"],
        risks: ["Execution risk"],
        tradeoffs: ["Higher cost"],
      },
    });

    expect(content).toContain("Should I launch?");
    expect(content).toContain("proceed");
    expect(content).toContain("91");
    expect(content).toContain("Strong demand");
    expect(content).toContain("Execution risk");
    expect(content).toContain("Higher cost");
  });

  it("formats Study content with the question, explanation, examples, and practice questions", () => {
    const content = getStudyShareContent("What is inflation?", {
      type: "study",
      explanation: "Inflation means prices rise over time.",
      examples: ["Food becomes more expensive."],
      practiceQuestions: ["What causes inflation?"],
    });

    expect(content).toContain("What is inflation?");
    expect(content).toContain("Inflation means prices rise over time.");
    expect(content).toContain("Food becomes more expensive.");
    expect(content).toContain("What causes inflation?");
  });
});
