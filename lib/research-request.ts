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
  const context = createResearchLanguageContext(
    question,
    outputLanguage,
  );

  return {
    question: context.question,
    language: context.language,
  };
}
