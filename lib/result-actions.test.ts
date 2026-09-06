import { describe, expect, it } from "vitest";
import { getResultActionLabels, getResultActionBar } from "./result-actions";

describe("result action bar", () => {
  it("provides the shared actions for research and study results", () => {
    expect(getResultActionLabels()).toEqual([
      "Download",
      "Share",
      "Print",
      "Delete",
      "Copy",
    ]);
  });

  it("returns the same action bar for research and study results", () => {
    expect(getResultActionBar("research")).toEqual(getResultActionLabels());
    expect(getResultActionBar("study")).toEqual(getResultActionLabels());
  });
});
