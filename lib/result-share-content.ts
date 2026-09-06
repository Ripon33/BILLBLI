import type { StudyResponse } from "./study-response";

type ResearchShareResult = {
  analysis?: {
    decision?: string;
    confidence?: number;
    summary?: string;
  };
  recommendation?: {
    recommendation: string;
    confidence: number;
    why: string[];
    risks: string[];
    tradeoffs: string[];
  };
};

export function getResearchShareContent(
  question: string,
  result: ResearchShareResult,
): string {
  const sections = [question];

  if (result.analysis?.decision) {
    sections.push(`Decision: ${result.analysis.decision}`);
  }

  if (typeof result.analysis?.confidence === "number") {
    sections.push(`Confidence: ${result.analysis.confidence}%`);
  }

  if (result.analysis?.summary) {
    sections.push(`Summary: ${result.analysis.summary}`);
  }

  if (result.recommendation) {
    sections.push(`Recommendation: ${result.recommendation.recommendation}`);
    sections.push(
      `Recommendation confidence: ${result.recommendation.confidence}%`,
    );

    if (result.recommendation.why.length) {
      sections.push(`Why:\n${result.recommendation.why.join("\n")}`);
    }

    if (result.recommendation.risks.length) {
      sections.push(`Risks:\n${result.recommendation.risks.join("\n")}`);
    }

    if (result.recommendation.tradeoffs.length) {
      sections.push(
        `Trade-offs:\n${result.recommendation.tradeoffs.join("\n")}`,
      );
    }
  }

  return sections.join("\n\n");
}

export function getStudyShareContent(
  question: string,
  result: StudyResponse,
): string {
  const sections = [
    question,
    `Explanation:\n${result.explanation}`,
  ];

  if (result.examples.length) {
    sections.push(`Examples:\n${result.examples.join("\n")}`);
  }

  if (result.practiceQuestions.length) {
    sections.push(
      `Practice questions:\n${result.practiceQuestions.join("\n")}`,
    );
  }

  return sections.join("\n\n");
}
