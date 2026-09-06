import { describe, expect, it } from "vitest";
import { createHistoryItem } from "./research-history";
import { deleteCurrentResult } from "./current-result-delete";

describe("deleteCurrentResult", () => {
  it("deletes a research result and returns cleared UI state", () => {
    const current = createHistoryItem("Should I invest?", {
      analysis: { decision: "Yes" },
    });
    const other = createHistoryItem("Should I wait?", {
      analysis: { decision: "No" },
    });

    const storage = {
      values: new Map<string, string>(),
      setItem(key: string, value: string) {
        this.values.set(key, value);
      },
    };

    const state = deleteCurrentResult({
      route: "research",
      id: current.id,
      history: [current, other],
      studyHistory: [],
      storage,
    });

    expect(state.history).toEqual([other]);
    expect(state.studyHistory).toEqual([]);
    expect(state.result).toBeNull();
    expect(state.question).toBe("");
    expect(storage.values.get("billbli-research-history")).toBe(
      JSON.stringify([other]),
    );
  });

  it("deletes a study result and returns cleared UI state", () => {
    const current = createHistoryItem("What is inflation?", {
      explanation: "Prices increase over time.",
    });
    const other = createHistoryItem("What is GDP?", {
      explanation: "Gross domestic product.",
    });

    const storage = {
      values: new Map<string, string>(),
      setItem(key: string, value: string) {
        this.values.set(key, value);
      },
    };

    const state = deleteCurrentResult({
      route: "study",
      id: current.id,
      history: [],
      studyHistory: [current, other],
      storage,
    });

    expect(state.history).toEqual([]);
    expect(state.studyHistory).toEqual([other]);
    expect(state.result).toBeNull();
    expect(state.question).toBe("");
    expect(storage.values.get("billbli-study-history")).toBe(
      JSON.stringify([other]),
    );
  });
});
