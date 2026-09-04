import {
  createDecisionLanguageContext,
  type DecisionLanguage,
} from "./multilingual-decision";

export interface ResearchLanguageContext {
  question: string;
  language: {
    input: DecisionLanguage;
    output: DecisionLanguage;
  };
}

export function createResearchLanguageContext(
  question: string,
  outputLanguage?: DecisionLanguage,
): ResearchLanguageContext {
  const trimmedQuestion = question.trim();
  const languageContext = createDecisionLanguageContext(
    trimmedQuestion,
    outputLanguage,
  );

  return {
    question: trimmedQuestion,
    language: {
      input: languageContext.inputLanguage,
      output: languageContext.outputLanguage,
    },
  };
}
