import { describe, expect, it } from "vitest";
import { createResearchRequest } from "./research-request";

describe("research request", () => {
  it("attaches Bangla language metadata to a Bangla question", () => {
    const request = createResearchRequest(
      "বাংলাদেশে কোন ব্যবসা শুরু করা ভালো?"
    );

    expect(request).toEqual({
      question: "বাংলাদেশে কোন ব্যবসা শুরু করা ভালো?",
      language: {
        input: "bn",
        output: "bn",
      },
    });
  });

  it("keeps the original English question unchanged", () => {
    const request = createResearchRequest(
      "Which business should I start in Bangladesh?"
    );

    expect(request.question).toBe(
      "Which business should I start in Bangladesh?"
    );

    expect(request.language).toEqual({
      input: "en",
      output: "en",
    });
  });

  it("supports mixed Bangla and English questions", () => {
    const request = createResearchRequest(
      "বাংলাদেশে কোন business শুরু করা ভালো?"
    );

    expect(request.language).toEqual({
      input: "bn",
      output: "bn",
    });
  });
});
