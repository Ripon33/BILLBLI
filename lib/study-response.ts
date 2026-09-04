export type StudyResponse = {
  type: "study";
  explanation: string;
  examples: string[];
  practiceQuestions: string[];
};

export function createStudyResponse(input: {
  explanation: string;
  examples: string[];
  practiceQuestions: string[];
}): StudyResponse {
  return {
    type: "study",
    explanation: input.explanation,
    examples: input.examples,
    practiceQuestions: input.practiceQuestions,
  };
}
