import { describe, expect, it, vi } from "vitest";
import { shareResult } from "./result-share";

describe("result sharing", () => {
  it("uses native Web Share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { share },
    });

    await shareResult("BILLBLI Research", "Research result content");

    expect(share).toHaveBeenCalledWith({
      title: "BILLBLI Research",
      text: "Research result content",
    });
  });

  it("falls back to clipboard when native sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { clipboard: { writeText } },
    });

    await shareResult("BILLBLI Study", "Study result content");

    expect(writeText).toHaveBeenCalledWith("Study result content");
  });
});
