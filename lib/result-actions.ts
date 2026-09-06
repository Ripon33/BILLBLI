export type ResultRoute = "research" | "study";

const RESULT_ACTION_LABELS = [
  "Download",
  "Share",
  "Print",
  "Delete",
  "Copy",
] as const;

export function getResultActionLabels(): string[] {
  return [...RESULT_ACTION_LABELS];
}

export function getResultActionBar(_route: ResultRoute): string[] {
  return getResultActionLabels();
}
