import { describe, expect, it, vi } from "vitest";
import { createShareHandler } from "./result-share-handler";

describe("result share handler", () => {
  it("shares Research results with the Research title and question", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    const handler = createShareHandler(
      "research",
      "Should I invest?",
      "Research result content",
      share,
    );

    await handler();

    expect(share).toHaveBeenCalledWith(
      "BILLBLI Research",
      expect.stringContaining("Should I invest?"),
    );
  });

  it("shares Study results with the Study title and question", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    const handler = createShareHandler(
      "study",
      "What is inflation?",
      "Study result content",
      share,
    );

    await handler();

    expect(share).toHaveBeenCalledWith(
      "BILLBLI Study",
      expect.stringContaining("What is inflation?"),
    );
  });
});

  it("includes both the question and result content in shared text", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    const handler = createShareHandler(
      "research",
      "Should I invest?",
      "Recommendation: Proceed with caution.",
      share,
    );

    await handler();

    expect(share).toHaveBeenCalledWith(
      "BILLBLI Research",
      "Should I invest?\n\nRecommendation: Proceed with caution.",
    );
  });

  it("does not duplicate the question when share content already includes it", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    const handler = createShareHandler(
      "research",
      "Should I invest?",
      "Should I invest?\n\nRecommendation: Invest",
      share,
    );

    await handler();

    expect(share).toHaveBeenCalledWith(
      "BILLBLI Research",
      "Should I invest?\n\nRecommendation: Invest",
    );
  });
