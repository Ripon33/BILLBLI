const RESEARCH_DIMENSIONS = [
  "market demand industry trends",
  "competitors pricing business economics",
  "customers technology adoption",
  "regulation risks challenges latest evidence",
];

export function buildResearchQueries(question: string): string[] {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return [];
  }

  return [
    trimmedQuestion,
    ...RESEARCH_DIMENSIONS.map(
      (dimension) => `${trimmedQuestion} ${dimension}`
    ),
  ];
}
