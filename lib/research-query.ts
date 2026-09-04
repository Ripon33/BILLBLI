import type { DecisionContext } from "./decision-context";
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

export function buildResearchQueries(question: string, context?: DecisionContext): string[] {
  const trimmedQuestion = question.trim();

  const contextTerms = [
    context?.objective,
    context?.location,
    context?.budget,
    context?.timeframe,
  ].filter(Boolean).join(" ");

  if (!trimmedQuestion) {
    return [];
  }

  const queries = [
    trimmedQuestion,
    ...RESEARCH_DIMENSIONS.map(
      (dimension) => `${trimmedQuestion} ${dimension}`
    ),
  ];

  const location = context?.location || extractEnglishLocation(trimmedQuestion);

  if (location) {
    const subject =
      context?.objective || extractEnglishBusinessSubject(trimmedQuestion);

    const contextTerms = [
      context?.budget,
      context?.timeframe,
      ...(context?.constraints ?? []),
    ]
      .filter(Boolean)
      .join(" ");

    const contextSuffix = contextTerms ? ` ${contextTerms}` : "";

    queries.push(
      `${location} ${subject} market demand Bangladesh${contextSuffix}`,
      `${location} ${subject} competitors pricing Bangladesh${contextSuffix}`,
      `${location} ${subject} startup costs profitability Bangladesh${contextSuffix}`,
      `${location} ${subject} regulations licensing Bangladesh${contextSuffix}`,
      `${location} tourism seasonality visitor demand business${contextSuffix}`,
    );
  }

  return Array.from(new Set(queries));
}
