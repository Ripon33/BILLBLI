import type { DecisionLanguage } from "./multilingual-decision";

const LANGUAGE_NAMES: Record<string, string> = {
  bn: "Bangla",
  en: "English",
  ar: "Arabic",
  hi: "Hindi",
  ur: "Urdu",
  fa: "Persian",
  he: "Hebrew",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  th: "Thai",
  vi: "Vietnamese",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  pl: "Polish",
  uk: "Ukrainian",
  id: "Indonesian",
  ms: "Malay",
  other: "the user's input language",
};

export function buildResearchLanguageInstruction(
  language: DecisionLanguage,
): string {
  const languageName =
    LANGUAGE_NAMES[language] || "the user's input language";

  return `
OUTPUT LANGUAGE — NON-NEGOTIABLE:
- Respond entirely in ${languageName}.
- The user's decision must be analyzed and explained in ${languageName}.
- Do not switch to English merely because the research sources are in English.
- Preserve source titles, URLs, proper nouns, technical names, and direct quotes in their original form when necessary for accuracy.
- Translate the surrounding explanation into ${languageName}.
- If sources contain conflicting evidence, explain the conflict in ${languageName}.
- Keep the required JSON keys exactly as specified by the schema, but write all user-facing JSON string values in ${languageName}.
`;
}
