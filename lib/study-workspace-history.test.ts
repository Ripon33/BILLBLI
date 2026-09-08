import { describe, expect, it } from "vitest";
import { saveStudyWorkspaceResult, loadStudyWorkspaceHistory } from "./study-workspace-history";
import { STUDY_HISTORY_KEY } from "./study-history";

describe("saveStudyWorkspaceResult", () => {
  it("persists a Study result using the existing Study History contract", () => {
    const storage = {
      calls: [] as Array<[string, string]>,
      setItem(key: string, value: string) {
        this.calls.push([key, value]);
      },
    };

    const result = {
      type: "study" as const,
      explanation: "AI is explained step by step.",
      examples: ["Example one"],
      practiceQuestions: ["Practice one"],
    };

    const history = saveStudyWorkspaceResult(
      storage,
      [],
      "Explain artificial intelligence",
      result,
    );

    expect(history).toHaveLength(1);
    expect(history[0]?.question).toBe("Explain artificial intelligence");
    expect(history[0]?.result).toEqual(result);
    expect(storage.calls).toHaveLength(1);
    expect(storage.calls[0]?.[0]).toBe(STUDY_HISTORY_KEY);
  });
});

describe("loadStudyWorkspaceHistory", () => {
  it("loads Study History from the existing dedicated storage key", () => {
    const history = [
      {
        id: "study-1",
        question: "What is AI?",
        createdAt: "2026-01-01T00:00:00.000Z",
        result: {
          type: "study" as const,
          explanation: "AI explained simply.",
          examples: [],
          practiceQuestions: [],
        },
      },
    ];

    const storage = {
      getItem(key: string) {
        expect(key).toBe(STUDY_HISTORY_KEY);
        return JSON.stringify(history);
      },
    };

    expect(loadStudyWorkspaceHistory(storage)).toEqual(history);
  });

  it("returns an empty history when stored Study History is malformed", () => {
    const storage = {
      getItem(_key: string) {
        return "{not-valid-json";
      },
    };

    expect(loadStudyWorkspaceHistory(storage)).toEqual([]);
  });
});
