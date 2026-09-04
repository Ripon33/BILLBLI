const RESEARCH_DIMENSIONS = [
  "local market demand",
  "competitors pricing",
  "startup costs profitability",
  "regulations licensing",
  "risks seasonality",
];

const LOCATION_PATTERNS = [
  /\bin\s+([A-Za-z][A-Za-z\s.'-]{1,60})\b/i,
  /\bat\s+([A-Za-z][A-Za-z\s.'-]{1,60})\b/i,
  /\bnear\s+([A-Za-z][A-Za-z\s.'-]{1,60})\b/i,
];

function extractEnglishLocation(question: string): string | undefined {
  for (const pattern of LOCATION_PATTERNS) {
    const match = question.match(pattern);

    if (match?.[1]) {
      return match[1]
        .replace(/[?.!,]+$/, "")
        .trim();
    }
  }

  if (/কক্সবাজার/u.test(question)) {
    return "Cox's Bazar";
  }

  return undefined;
}

function extractEnglishBusinessSubject(question: string): string {
  if (/কফি\s*শপ/u.test(question) || /coffee\s*shop/i.test(question)) {
    return "coffee shop";
  }

  if (/রেস্টুরেন্ট/u.test(question) || /restaurant/i.test(question)) {
    return "restaurant";
  }

  if (/হোটেল/u.test(question) || /hotel/i.test(question)) {
    return "hotel";
  }

  return "business";
}

export function buildResearchQueries(question: string): string[] {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return [];
  }

  const queries = [
    trimmedQuestion,
    ...RESEARCH_DIMENSIONS.map(
      (dimension) => `${trimmedQuestion} ${dimension}`
    ),
  ];

  const location = extractEnglishLocation(trimmedQuestion);

  if (location) {
    const subject = extractEnglishBusinessSubject(trimmedQuestion);

    queries.push(
      `${location} ${subject} market demand Bangladesh`,
      `${location} ${subject} competitors pricing Bangladesh`,
      `${location} ${subject} startup costs profitability Bangladesh`,
      `${location} ${subject} regulations licensing Bangladesh`,
      `${location} tourism seasonality visitor demand business`,
    );
  }

  return Array.from(new Set(queries));
}
