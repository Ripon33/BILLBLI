import { describe, expect, it } from "vitest";
import {
  detectDecisionLanguage,
  createDecisionLanguageContext,
  withDecisionLanguage,
} from "./multilingual-decision";

describe("multilingual decision layer", () => {
  it("detects Bangla input and uses Bangla as the default output language", () => {
    const context = createDecisionLanguageContext(
      "বাংলাদেশে ৫ লাখ টাকার মধ্যে কোন ব্যবসা শুরু করা ভালো?"
    );

    expect(context.inputLanguage).toBe("bn");
    expect(context.outputLanguage).toBe("bn");
  });

  it("detects Arabic input", () => {
    expect(detectDecisionLanguage("ما هو أفضل هاتف للجامعة؟")).toBe("ar");
  });

  it("detects English input", () => {
    expect(detectDecisionLanguage("Which laptop should I buy for university?")).toBe("en");
  });

  it("supports mixed-language input without losing the primary language", () => {
    const context = createDecisionLanguageContext(
      "আমার budget $1200, which laptop should I buy?"
    );

    expect(context.inputLanguage).toBe("bn");
    expect(context.outputLanguage).toBe("bn");
  });
});

describe("decision language metadata", () => {
  it("attaches detected language metadata to a decision", () => {
    const decision = {
      question: "বাংলাদেশে কোন ব্যবসা শুরু করা ভালো?",
      decision: {} as never,
      decision_factors: [],
      claims: [],
      evidence: [],
      alternatives: [],
      risks: [],
      assumptions: [],
      conflicts: [],
      reassessment_triggers: [],
      sources: [],
    };

    const result = withDecisionLanguage(
      decision,
      "বাংলাদেশে কোন ব্যবসা শুরু করা ভালো?"
    );

    expect(result.language).toEqual({
      input: "bn",
      output: "bn",
    });
  });
});
