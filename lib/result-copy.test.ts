import { describe, expect, it, vi } from "vitest";
import { copyResult } from "./result-copy";

describe("copyResult", () => {
  it("copies the provided result text to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    });

    try {
      await copyResult("Should I invest?\n\nDecision: Yes");

      expect(writeText).toHaveBeenCalledWith(
        "Should I invest?\n\nDecision: Yes",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("returns false when clipboard access is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    try {
      await expect(copyResult("Some result")).resolves.toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
