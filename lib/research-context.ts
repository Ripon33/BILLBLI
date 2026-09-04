export interface ResearchContextSource {
  title?: string;
  content?: string;
  url?: string;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC");
}

export function scoreResearchContextFit(
  question: string,
  source: ResearchContextSource,
): number {
  const decisionQuestion = normalizeText(question);
  const sourceText = normalizeText(
    `${source.title ?? ""} ${source.content ?? ""}`,
  );

  let score = 0;

  // Geographic/context fit.
  const locationPairs: Array<[RegExp, RegExp]> = [
    [/কক্সবাজার/u, /কক্সবাজার/u],
    [/\bcox'?s\s+bazar\b/i, /\bcox'?s\s+bazar\b/i],
    [/\bdhaka\b/i, /\bdhaka\b/i],
    [/\bchittagong\b|\bchattogram\b/i, /\bchittagong\b|\bchattogram\b/i],
    [/\bsylhet\b/i, /\bsylhet\b/i],
    [/\bmuscat\b/i, /\bmuscat\b/i],
    [/\bdubai\b/i, /\bdubai\b/i],
  ];

  for (const [questionPattern, sourcePattern] of locationPairs) {
    if (
      questionPattern.test(decisionQuestion) &&
      sourcePattern.test(sourceText)
    ) {
      score += 50;
      break;
    }
  }

  // Business/subject fit.
  const subjectPairs: Array<[RegExp, RegExp]> = [
    [
      /কফি\s*শপ|ক্যাফে|coffee\s*shop|cafe/i,
      /কফি\s*শপ|ক্যাফে|coffee\s*shop|cafe/i,
    ],
    [
      /রেস্টুরেন্ট|restaurant/i,
      /রেস্টুরেন্ট|restaurant/i,
    ],
    [
      /হোটেল|hotel/i,
      /হোটেল|hotel/i,
    ],
    [
      /ব্যবসা|business/i,
      /ব্যবসা|business/i,
    ],
  ];

  for (const [questionPattern, sourcePattern] of subjectPairs) {
    if (
      questionPattern.test(decisionQuestion) &&
      sourcePattern.test(sourceText)
    ) {
      score += 30;
      break;
    }
  }

  return Math.min(100, score);
}
