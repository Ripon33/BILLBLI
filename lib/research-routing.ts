import type { IntentClassification } from "./intent-engine";

export function shouldUseWebResearch(
  input: string,
  classification?: IntentClassification,
): boolean {
  if (classification) {
    if (classification.primaryIntent === "learn") {
      return false;
    }

    return (
      classification.primaryIntent === "research" ||
      classification.primaryIntent === "decide"
    );
  }

  const normalized = input.toLowerCase();

  if (
    /\b(explain|learn|teach|study|homework|exam|quiz|practice)\b/.test(
      normalized,
    )
  ) {
    return false;
  }

  return /\b(research|compare|market|competitor|price|cost|regulation|risk|should i|which should i|recommend)\b/.test(
    normalized,
  );
}
