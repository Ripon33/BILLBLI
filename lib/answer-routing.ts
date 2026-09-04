import { classifyIntent } from "./intent-engine";
import type { IntentClassification } from "./intent-engine";

export type AnswerRoute = "study" | "research";

export function getAnswerRoute(
  input: string,
  classification?: IntentClassification,
): AnswerRoute {
  const result = classification ?? classifyIntent(input);

  return result.primaryIntent === "learn" ? "study" : "research";
}
