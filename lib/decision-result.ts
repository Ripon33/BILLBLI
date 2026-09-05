export type Recommendation = "proceed" | "do_not_proceed" | "conditional";

export function getRecommendationLabel(
  recommendation: Recommendation,
): string {
  switch (recommendation) {
    case "proceed":
      return "Proceed";
    case "do_not_proceed":
      return "Do not proceed";
    case "conditional":
      return "Conditional decision";
  }
}

export interface ReassessmentData {
  reassessmentTriggers: string[];
  whatWouldChange: string[];
}

export function getReassessmentItems(
  reassessment: ReassessmentData | undefined,
  fallback: string[] | undefined,
): string[] {
  if (reassessment) {
    return [
      ...new Set([
        ...reassessment.whatWouldChange,
        ...reassessment.reassessmentTriggers,
      ]),
    ];
  }

  return [...new Set(fallback ?? [])];
}
