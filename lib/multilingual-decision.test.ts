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

  it("uses an explicit output-language request for Romanized input", () => {
    const context = createDecisionLanguageContext(
      "ami keno onno platform chere billbli use korbo? write in bangla language",
    );

    expect(context.outputLanguage).toBe("bn");
  });

  it("detects explicit output-language requests across all supported languages", () => {
    const cases = [
      ["please write in English", "en"],
      ["please write in Bangla", "bn"],
      ["please write in Arabic", "ar"],
      ["please write in Hindi", "hi"],
      ["please write in Urdu", "ur"],
      ["please write in Persian", "fa"],
      ["please write in Hebrew", "he"],
      ["please write in Chinese", "zh"],
      ["please write in Japanese", "ja"],
      ["please write in Korean", "ko"],
      ["please write in Russian", "ru"],
      ["please write in Thai", "th"],
      ["please write in Vietnamese", "vi"],
      ["please write in Turkish", "tr"],
      ["please write in Spanish", "es"],
      ["please write in French", "fr"],
      ["please write in German", "de"],
      ["please write in Portuguese", "pt"],
      ["please write in Italian", "it"],
      ["please write in Dutch", "nl"],
      ["please write in Polish", "pl"],
      ["please write in Ukrainian", "uk"],
      ["please write in Indonesian", "id"],
      ["please write in Malay", "ms"],
    ] as const;

    for (const [question, expectedLanguage] of cases) {
      const context = createDecisionLanguageContext(question);

      expect(context.outputLanguage).toBe(expectedLanguage);
    }
  });
