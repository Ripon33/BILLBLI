import type { ResearchHistoryItem } from "./research-history";
import { getStudyHistoryRestoreState } from "./study-history";

export function findHistoryRestoreItem<T>(
  history: ResearchHistoryItem<T>[],
  id: string,
): ResearchHistoryItem<T> | undefined {
  return history.find((item) => item.id === id);
}


export function findHistoryRestoreItemByRoute<T>(
  route: "research" | "study",
  id: string,
  researchHistory: ResearchHistoryItem<T>[],
  studyHistory: ResearchHistoryItem<T>[],
): {
  question: string;
  result: T;
  route: "research" | "study";
} | undefined {
  const item =
    route === "research"
      ? findHistoryRestoreItem(researchHistory, id)
      : findHistoryRestoreItem(studyHistory, id);

  if (!item) return undefined;

  return route === "research"
    ? getHistoryRestoreState(item)
    : getStudyHistoryRestoreState(item);
}

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

export function resolveWorkspaceHistoryRestore<T>(
  route: string,
  id: string,
  researchHistory: ResearchHistoryItem<T>[],
  studyHistory: ResearchHistoryItem<T>[],
): {
  question: string;
  result: T;
  route: "research" | "study";
} | undefined {
  if (route !== "research" && route !== "study") {
    return undefined;
  }

  return findHistoryRestoreItemByRoute(
    route,
    id,
    researchHistory,
    studyHistory,
  );
}
