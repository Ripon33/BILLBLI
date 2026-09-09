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

describe("workspace history restore lookup", () => {
  it("resolves a research history item by id", async () => {
    const { findHistoryRestoreItem } = await import("./history-restore");

    const item = {
      id: "research-123",
      question: "Should we expand?",
      createdAt: new Date().toISOString(),
      result: { analysis: { decision: "Expand" } },
    };

    expect(
      findHistoryRestoreItem([item], "research-123"),
    ).toEqual(item);
  });
});

describe("workspace history route restore", () => {
  it("resolves the requested research or study item by route and id", async () => {
    const {
      findHistoryRestoreItemByRoute,
    } = await import("./history-restore");

    const research = {
      id: "research-123",
      question: "Research question",
      createdAt: new Date().toISOString(),
      result: { kind: "research" },
    };

    const study = {
      id: "study-456",
      question: "Study question",
      createdAt: new Date().toISOString(),
      result: { kind: "study" },
    };

    expect(
      findHistoryRestoreItemByRoute(
        "research",
        "research-123",
        [research],
        [study],
      ),
    ).toEqual({
      question: research.question,
      result: research.result,
      route: "research",
    });

    expect(
      findHistoryRestoreItemByRoute(
        "study",
        "study-456",
        [research],
        [study],
      ),
    ).toEqual({
      question: study.question,
      result: study.result,
      route: "study",
    });
  });
});

describe("workspace history restore request", () => {
  it("resolves a valid workspace restore request", async () => {
    const {
      resolveWorkspaceHistoryRestore,
    } = await import("./history-restore");

    const research = {
      id: "research-123",
      question: "Research question",
      createdAt: new Date().toISOString(),
      result: { kind: "research" },
    };

    const study = {
      id: "study-456",
      question: "Study question",
      createdAt: new Date().toISOString(),
      result: { kind: "study" },
    };

    expect(
      resolveWorkspaceHistoryRestore(
        "research",
        "research-123",
        [research],
        [study],
      ),
    ).toEqual({
      question: research.question,
      result: research.result,
      route: "research",
    });

    expect(
      resolveWorkspaceHistoryRestore(
        "invalid",
        "research-123",
        [research],
        [study],
      ),
    ).toBeUndefined();
  });
});
