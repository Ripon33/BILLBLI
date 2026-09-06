import { describe, expect, it, vi } from "vitest";
import {
  getPrintDocumentTitle,
  printResult,
} from "./result-print";

describe("result printing", () => {
  it("creates a stable print title for research and study results", () => {
    expect(getPrintDocumentTitle("research", "Should I invest?")).toBe(
      "BILLBLI Research — Should I invest?",
    );

    expect(getPrintDocumentTitle("study", "Explain quantum computing")).toBe(
      "BILLBLI Study — Explain quantum computing",
    );
  });

  it("prints the current result using the generated document title", () => {
    const originalWindow = globalThis.window;
    const print = vi.fn();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { print },
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { title: "Original title" },
    });

    printResult("research", "Should I invest?");

    expect(document.title).toBe(
      "BILLBLI Research — Should I invest?",
    );
    expect(print).toHaveBeenCalledOnce();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
