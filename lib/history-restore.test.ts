import { describe, expect, it } from "vitest";
import { createHistoryItem } from "./research-history";
import { restoreHistoryItem, getHistoryRestoreState } from "./history-restore";
import { getStudyHistoryRestoreState } from "./study-history";

describe("history restore", () => {
  it("returns Research restore state with the research route", () => {
    const researchResult = {
      question: "Should I start this business?",
      analysis: {
        decision: "Recommend",
        score: 84,
      },
    };

    const item = createHistoryItem(
      "Should I start this business?",
      researchResult,
    );

    expect(getHistoryRestoreState(item)).toEqual({
      question: "Should I start this business?",
      result: researchResult,
      route: "research",
    });
  });

  it("restores the saved research question and result", () => {
    const researchResult = {
      question: "Should I start this business?",
      analysis: {
        decision: "Recommend",
        score: 84,
      },
    };

    const item = createHistoryItem(
      "Should I start this business?",
      researchResult,
    );

    expect(restoreHistoryItem(item)).toEqual({
      question: "Should I start this business?",
      result: researchResult,
    });
  });

  it("preserves the answer route when restoring a Research result", () => {
    const researchResult = {
      question: "Should I start this business?",
      analysis: {
        decision: "Recommend",
        score: 84,
      },
    };

    const item = createHistoryItem(
      "Should I start this business?",
      researchResult,
    );

    const restored = restoreHistoryItem(item);

    expect(restored.result).toEqual(researchResult);
    expect(restored.question).toBe("Should I start this business?");
  });

  it("returns Study restore state with the study route", () => {
    const studyResult = {
      type: "study",
      explanation: "AI is explained step by step.",
      examples: ["Example one"],
    };

    const item = createHistoryItem(
      "Explain artificial intelligence",
      studyResult,
    );

    expect(getStudyHistoryRestoreState(item)).toEqual({
      question: "Explain artificial intelligence",
      result: studyResult,
      route: "study",
    });
  });

  it("restores a saved Study result", () => {
    const studyResult = {
      type: "study",
      explanation: "AI is explained step by step.",
      examples: ["Example one"],
    };

    const item = createHistoryItem(
      "Explain artificial intelligence",
      studyResult,
    );

    expect(restoreHistoryItem(item)).toEqual({
      question: "Explain artificial intelligence",
      result: studyResult,
    });
  });
});
