import {
  createResearchLanguageContext,
} from "./research-language";
import type { DecisionLanguage } from "./multilingual-decision";

export interface ResearchRequest {
  question: string;
  language: {
    input: DecisionLanguage;
    output: DecisionLanguage;
  };
}

export function createResearchRequest(
  question: string,
  outputLanguage?: DecisionLanguage,
): ResearchRequest {
  if (question.length > 4000) {
    throw new Error("Question is too long.");
  }

  const context = createResearchLanguageContext(
    question,
    outputLanguage,
  );

  return {
    question: context.question,
    language: context.language,
  };
}
