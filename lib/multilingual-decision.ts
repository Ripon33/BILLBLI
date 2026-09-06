/**
 * Language metadata for BILLBLI decisions.
 *
 * The decision engine remains language-independent.
 * Language is used only for understanding/presentation around the
 * universal decision model.
 */
export type DecisionLanguage =
  | "auto"
  | "en"
  | "bn"
  | "ar"
  | "hi"
  | "ur"
  | "fa"
  | "he"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "th"
  | "vi"
  | "tr"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "nl"
  | "pl"
  | "uk"
  | "id"
  | "ms"
  | "other";

export interface DecisionLanguageContext {
  inputLanguage: DecisionLanguage;
  outputLanguage: DecisionLanguage;
}

/**
 * Counts meaningful Unicode script characters.
 * Punctuation, numbers and whitespace are intentionally ignored.
 */
function countMatches(text: string, pattern: RegExp): number {
  return Array.from(text).filter((character) => pattern.test(character)).length;
}

/**
 * Detects an explicit output-language request in natural-language input.
 *
 * Explicit requests take precedence over automatic script detection.
 * This is especially important for Romanized languages and mixed-language
 * questions where the requested response language may not match the script
 * used in the question.
 */
function detectExplicitOutputLanguage(text: string): DecisionLanguage | null {
  const input = text.toLowerCase();

  const languageNames: Array<[DecisionLanguage, string[]]> = [
    ["en", ["english"]],
    ["bn", ["bangla", "bengali"]],
    ["ar", ["arabic"]],
    ["hi", ["hindi"]],
    ["ur", ["urdu"]],
    ["fa", ["persian", "farsi"]],
    ["he", ["hebrew"]],
    ["zh", ["chinese", "mandarin"]],
    ["ja", ["japanese"]],
    ["ko", ["korean"]],
    ["ru", ["russian"]],
    ["th", ["thai"]],
    ["vi", ["vietnamese"]],
    ["tr", ["turkish"]],
    ["es", ["spanish"]],
    ["fr", ["french"]],
    ["de", ["german"]],
    ["pt", ["portuguese"]],
    ["it", ["italian"]],
    ["nl", ["dutch"]],
    ["pl", ["polish"]],
    ["uk", ["ukrainian"]],
    ["id", ["indonesian"]],
    ["ms", ["malay"]],
  ];

  for (const [language, names] of languageNames) {
    for (const name of names) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `\\b(?:write|respond|reply|answer|explain|speak)\\s+(?:in\\s+)?${escapedName}\\b|` +
        `\\b(?:write|respond|reply|answer|explain|speak)\\s+(?:the\\s+)?${escapedName}\\b|` +
        `\\b(?:in|using)\\s+(?:the\\s+)?${escapedName}\\b`,
        "i",
      );

      if (pattern.test(input)) {
        return language;
      }
    }
  }

  return null;
}

/**
 * Detects the dominant language/script for a decision input.
 *
 * This is intentionally deterministic and dependency-free.
 * A future AI language detector can enrich this without changing the
 * DecisionObject or decision-scoring architecture.
 */
export function detectDecisionLanguage(text: string): DecisionLanguage {
  const input = text.trim();

  if (!input) {
    return "auto";
  }

  const explicitOutputLanguage = detectExplicitOutputLanguage(input);
  if (explicitOutputLanguage) {
    return explicitOutputLanguage;
  }

  // Prefer a meaningful non-Latin script over incidental English
  // words such as "budget", "laptop", or "AI" in mixed-language input.
  const scriptScores: Array<[DecisionLanguage, number]> = [
    ["bn", countMatches(input, /[\u0980-\u09FF]/u)],
    ["ar", countMatches(input, /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u)],
    ["hi", countMatches(input, /[\u0900-\u097F]/u)],
    ["he", countMatches(input, /[\u0590-\u05FF]/u)],
    ["zh", countMatches(input, /[\u3400-\u4DBF\u4E00-\u9FFF]/u)],
    ["ja", countMatches(input, /[\u3040-\u30FF]/u)],
    ["ko", countMatches(input, /[\uAC00-\uD7AF\u1100-\u11FF]/u)],
    ["ru", countMatches(input, /[\u0400-\u04FF]/u)],
    ["th", countMatches(input, /[\u0E00-\u0E7F]/u)],
  ];

  scriptScores.sort((a, b) => b[1] - a[1]);

  const [scriptLanguage, scriptScore] = scriptScores[0];

  if (scriptScore >= 2) {
    return scriptLanguage;
  }

  if (/[A-Za-z]/u.test(input)) {
    return "en";
  }

  return "other";
}

/**
 * Creates the language context for a decision.
 *
 * Unless the user explicitly chooses another output language later,
 * BILLBLI responds in the dominant language of the user's input.
 */
export function createDecisionLanguageContext(
  input: string,
  outputLanguage?: DecisionLanguage,
): DecisionLanguageContext {
  const inputLanguage = detectDecisionLanguage(input);

  return {
    inputLanguage,
    outputLanguage:
      outputLanguage && outputLanguage !== "auto"
        ? outputLanguage
        : inputLanguage,
  };
}

import type { DecisionObject } from "./decision-intelligence";

/**
 * Attaches language metadata to an existing BILLBLI decision.
 *
 * The underlying decision remains language-independent. This only records
 * the language detected from the user's input and the language BILLBLI
 * should use for its response.
 */
export function withDecisionLanguage(
  decision: DecisionObject,
  input: string,
  outputLanguage?: DecisionLanguage,
): DecisionObject {
  const context = createDecisionLanguageContext(input, outputLanguage);

  return {
    ...decision,
    language: {
      input: context.inputLanguage,
      output: context.outputLanguage,
    },
  };
}
