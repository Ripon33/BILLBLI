import { classifyIntent } from "./intent-engine";
import type { IntentClassification } from "./intent-engine";

export type AnswerRoute = "study" | "research" | "task";

export function getAnswerRoute(
  input: string,
  classification?: IntentClassification,
): AnswerRoute {
  const result = classification ?? classifyIntent(input);

  if (result.primaryIntent === "execute") {
    return "task";
  }

  return result.primaryIntent === "learn" ? "study" : "research";
}
