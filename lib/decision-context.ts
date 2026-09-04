export interface DecisionContext {
  question: string;
  objective: string | null;
  constraints: string[];
  location: string | null;
  budget: string | null;
  timeframe: string | null;
  preferences: string[];
}

export function extractDecisionContext(
  question: string,
): DecisionContext {
  const normalized = question.trim();

  const locationMatch = normalized.match(
    /\b(?:in|at|near)\s+(.+?)(?=\s+(?:with|within|for|on|under)\b|\?|$)/i,
  );

  const budgetMatch = normalized.match(
    /(?:with|budget(?:\s+of)?|for)\s+(৳?\s*[\d,.]+\s*(?:lakh|crore|k|thousand|million|billion)?)/i,
  );

  const timeframeMatch = normalized.match(
    /\b(?:within|in|over)\s+(\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?))\b/i,
  );

  const objectiveMatch = normalized.match(
    /\b(?:should i|should we|do i|do we)\s+(.+?)(?=\s+(?:in|at|near)\s+|\s+with\s+|\s+within\s+|\?|$)/i,
  );

  return {
    question: normalized,
    objective: objectiveMatch?.[1]?.trim() || null,
    constraints: [
      ...(budgetMatch ? [`Budget: ${budgetMatch[1].trim()}`] : []),
      ...(timeframeMatch ? [`Timeframe: ${timeframeMatch[1].trim()}`] : []),
    ],
    location: locationMatch?.[1]?.trim() || null,
    budget: budgetMatch?.[1]?.trim() || null,
    timeframe: timeframeMatch?.[1]?.trim() || null,
    preferences: [],
  };
}
