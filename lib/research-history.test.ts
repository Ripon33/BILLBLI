import { describe, expect, it } from "vitest";
import {
  createHistoryItem,
  getHistoryPreview,
  parseHistory,
  persistHistory,
} from "./research-history";

describe("research history", () => {
  it("stores the complete research result", () => {
    const result = { question: "Test question", analysis: { decision: "Recommend" } };
    const item = createHistoryItem("Test question", result);
    expect(item.result).toEqual(result);
  });

  it("creates a useful preview from the research result", () => {
    const result = {
      question: "Should I start this business?",
      decision: {
        decision: { recommendation: "Recommend starting", score: 82, confidence: 88 },
      },
    };
    const item = createHistoryItem(result.question, result);
    expect(getHistoryPreview(item)).toEqual({
      question: "Should I start this business?",
      decision: "Recommend starting",
      score: 82,
      confidence: 88,
    });
  });

  it("does not crash when a history item has no research result", () => {
    const item = {
      question: "Old saved question",
      result: undefined,
    } as any;

    expect(getHistoryPreview(item)).toEqual({
      question: "Old saved question",
      decision: "Research completed",
      score: undefined,
      confidence: undefined,
    });
  });

  it("parses only valid history items and limits history to 12 entries", () => {
    const saved = JSON.stringify([
      ...Array.from({ length: 14 }, (_, index) => ({
        id: `history-${index + 1}`,
        question: `Question ${index + 1}`,
        createdAt: `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
        result: { question: `Question ${index + 1}` },
      })),
      {
        id: "invalid",
        question: "",
        createdAt: "not-a-date",
        result: null,
      },
    ]);

    const result = parseHistory(saved);

    expect(result).toHaveLength(12);
    expect(result[0]?.id).toBe("history-1");
    expect(result[11]?.id).toBe("history-12");
  });

  it("returns an empty history for malformed stored JSON", () => {
    expect(parseHistory("{not-valid-json")).toEqual([]);
  });

  it("does not throw when history persistence fails", () => {
    const storage = {
      setItem: () => {
        throw new Error("Storage quota exceeded");
      },
    };

    expect(() =>
      persistHistory(storage, "billbli-research-history", [
        {
          id: "history-1",
          question: "Test question",
          createdAt: "2026-01-01T00:00:00.000Z",
          result: { question: "Test question" },
        },
      ]),
    ).not.toThrow();
  });

});
