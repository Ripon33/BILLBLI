import { describe, expect, it } from "vitest";
import {
  createResearchLanguageContext,
} from "./research-language";

describe("research language context", () => {
  it("uses the detected input language as the default output language", () => {
    const context = createResearchLanguageContext(
      "বাংলাদেশে কোন ব্যবসা শুরু করা ভালো?"
    );

    expect(context.language).toEqual({
      input: "bn",
      output: "bn",
    });
  });

  it("preserves the original question while attaching language metadata", () => {
    const context = createResearchLanguageContext(
      "Which business should I start in Bangladesh?"
    );

    expect(context.question).toBe(
      "Which business should I start in Bangladesh?"
    );
    expect(context.language).toEqual({
      input: "en",
      output: "en",
    });
  });

  it("supports mixed Bangla and English input", () => {
    const context = createResearchLanguageContext(
      "বাংলাদেশে কোন business শুরু করা ভালো?"
    );

    expect(context.language).toEqual({
      input: "bn",
      output: "bn",
    });
  });
});
