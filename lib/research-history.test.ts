import { describe, expect, it } from "vitest";
import { createHistoryItem, getHistoryPreview } from "./research-history";

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

});
