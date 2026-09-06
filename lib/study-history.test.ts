import { describe, expect, it } from "vitest";
import {
  STUDY_HISTORY_KEY,
  addStudyHistoryItem,
  saveStudyHistory,
  deleteStudyHistoryItem,
} from "./study-history";

describe("study history", () => {
  it("uses a storage key separate from research history", () => {
    expect(STUDY_HISTORY_KEY).toBe("billbli-study-history");
    expect(STUDY_HISTORY_KEY).not.toBe("billbli-research-history");
  });

  it("limits persisted Study History to 12 entries", async () => {
    const { createHistoryItem, persistHistory } = await import("./research-history");

    const storage = {
      value: "",
      setItem(_key: string, value: string) {
        this.value = value;
      },
    };

    const history = Array.from({ length: 14 }, (_, index) =>
      createHistoryItem(`Study question ${index + 1}`, {
        type: "study",
        explanation: `Explanation ${index + 1}`,
      }),
    );

    persistHistory(storage, STUDY_HISTORY_KEY, history);

    expect(JSON.parse(storage.value)).toHaveLength(12);
  });

  it("removes a Study History item by id", async () => {
    const { createHistoryItem, removeHistoryItem } = await import("./research-history");

    const first = createHistoryItem("First study", {
      type: "study",
      explanation: "First explanation",
    });

    const second = createHistoryItem("Second study", {
      type: "study",
      explanation: "Second explanation",
    });

    const result = removeHistoryItem([first, second], first.id);

    expect(result).toEqual([second]);
  });

  it("adds a Study History item newest-first and limits it to 12 entries", async () => {
    const { createHistoryItem } = await import("./research-history");

    const history = Array.from({ length: 12 }, (_, index) =>
      createHistoryItem(`Study question ${index + 1}`, {
        type: "study",
        explanation: `Explanation ${index + 1}`,
      }),
    );

    const newest = createHistoryItem("New study question", {
      type: "study",
      explanation: "New explanation",
    });

    const result = addStudyHistoryItem(history, newest);

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual(newest);
    expect(result.some((item) => item.question === "Study question 12")).toBe(false);
  });

  it("creates and persists a Study History item", () => {
    const storage = {
      calls: [] as Array<[string, string]>,
      setItem(key: string, value: string) {
        this.calls.push([key, value]);
      },
    };

    const history: any[] = [];

    const result = saveStudyHistory(
      storage,
      history,
      "Explain artificial intelligence",
      {
        type: "study",
        explanation: "AI is explained step by step.",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.question).toBe("Explain artificial intelligence");
    expect(result[0]?.result).toEqual({
      type: "study",
      explanation: "AI is explained step by step.",
    });
    expect(storage.calls).toHaveLength(1);
    expect(storage.calls[0]?.[0]).toBe(STUDY_HISTORY_KEY);
  });

  it("persists the updated Study History after deletion", async () => {
    const storage = {
      calls: [] as Array<[string, string]>,
      setItem(key: string, value: string) {
        this.calls.push([key, value]);
      },
    };

    const first = {
      id: "study-1",
      question: "First study",
      createdAt: "2026-01-01T00:00:00.000Z",
      result: { type: "study", explanation: "First" },
    };

    const second = {
      id: "study-2",
      question: "Second study",
      createdAt: "2026-01-02T00:00:00.000Z",
      result: { type: "study", explanation: "Second" },
    };

    const next = deleteStudyHistoryItem(storage, [first, second], first.id);

    expect(next).toEqual([second]);
    expect(storage.calls).toHaveLength(1);
    expect(storage.calls[0]?.[0]).toBe(STUDY_HISTORY_KEY);
    expect(JSON.parse(storage.calls[0]?.[1] ?? "[]")).toEqual([second]);
  });

  it("persists Study History under its dedicated key", async () => {
    const { createHistoryItem, persistHistory } = await import("./research-history");

    const storage = {
      calls: [] as Array<[string, string]>,
      setItem(key: string, value: string) {
        this.calls.push([key, value]);
      },
    };

    const item = createHistoryItem("What is AI?", {
      type: "study",
      explanation: "AI explained simply.",
    });

    persistHistory(storage, STUDY_HISTORY_KEY, [item]);

    expect(storage.calls).toHaveLength(1);
    expect(storage.calls[0]?.[0]).toBe("billbli-study-history");
    expect(JSON.parse(storage.calls[0]?.[1] ?? "[]")).toEqual([item]);
  });
});
