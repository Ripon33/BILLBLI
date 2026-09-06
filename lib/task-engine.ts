import { classifyIntent } from "./intent-engine";

export type TaskStatus =
  | "ready"
  | "needs_input"
  | "waiting_approval"
  | "running"
  | "completed"
  | "failed";

export type BillbliTask = {
  id: string;
  input: string;
  intent: "learn" | "research" | "decide" | "plan" | "solve" | "execute";
  domain:
    | "study"
    | "shopping"
    | "research"
    | "business"
    | "career"
    | "healthcare"
    | "technology"
    | "travel"
    | "hr"
    | "finance"
    | "accounting"
    | "marketing"
    | "sales"
    | "operations"
    | "education"
    | "general";
  goal: string;
  requiredTools: string[];
  approvalRequired: boolean;
  status: TaskStatus;
};

export function createTask(input: string): BillbliTask {
  const classification = classifyIntent(input);

  const intent =
    classification.primaryMode === "study" &&
    classification.primaryIntent === "learn" &&
    /plan|schedule|study plan/i.test(input)
      ? "plan"
      : classification.primaryIntent;

  const goal =
    classification.primaryIntent === "execute" &&
    classification.primaryMode === "operations"
      ? "send_report"
      : classification.primaryIntent === "execute" &&
        classification.primaryMode === "travel"
        ? "book_flight"
        : classification.primaryMode === "shopping" &&
          classification.primaryIntent === "decide"
          ? "compare_products"
          : intent === "plan" &&
            classification.primaryMode === "study"
            ? "create_study_plan"
            : classification.primaryIntent === "research"
              ? "research"
              : "general";

  const requiredTools =
    classification.primaryIntent === "execute" &&
    classification.primaryMode === "operations"
      ? ["messaging"]
      : classification.primaryIntent === "execute" &&
        classification.primaryMode === "travel"
        ? ["travel_booking"]
        : classification.primaryMode === "shopping" ||
          classification.primaryIntent === "research"
          ? ["web_research"]
          : [];

  const approvalRequired =
    classification.primaryIntent === "execute";

  const status: TaskStatus =
    classification.primaryIntent === "execute" &&
    classification.primaryMode === "travel"
      ? "needs_input"
      : approvalRequired
        ? "waiting_approval"
        : "ready";

  return {
    id: crypto.randomUUID(),
    input,
    intent,
    domain: classification.primaryMode,
    goal,
    requiredTools,
    approvalRequired,
    status,
  };
}
