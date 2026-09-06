import type { ResearchHistoryItem } from "./research-history";

export function restoreHistoryItem<T>(
  item: ResearchHistoryItem<T>,
): {
  question: string;
  result: T;
} {
  return {
    question: item.question,
    result: item.result,
  };
}

export function getHistoryRestoreState<T>(
  item: ResearchHistoryItem<T>,
): {
  question: string;
  result: T;
  route: "research";
} {
  return {
    question: item.question,
    result: item.result,
    route: "research",
  };
}
