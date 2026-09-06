export const STUDY_HISTORY_KEY = "billbli-study-history";

import { persistHistory, type ResearchHistoryItem } from "./research-history";

export function getStudyHistoryRestoreState<T>(
  item: ResearchHistoryItem<T>,
): {
  question: string;
  result: T;
  route: "study";
} {
  return {
    question: item.question,
    result: item.result,
    route: "study",
  };
}

export function addStudyHistoryItem<T>(
  history: ResearchHistoryItem<T>[],
  item: ResearchHistoryItem<T>,
): ResearchHistoryItem<T>[] {
  return [
    item,
    ...history.filter(
      (existing) =>
        existing.question.toLowerCase() !== item.question.toLowerCase(),
    ),
  ].slice(0, 12);
}

export function saveStudyHistory<T>(
  storage: Pick<Storage, "setItem">,
  history: ResearchHistoryItem<T>[],
  question: string,
  result: T,
): ResearchHistoryItem<T>[] {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    createdAt: new Date().toISOString(),
    result,
  };

  const next = addStudyHistoryItem(history, item);
  persistHistory(storage, STUDY_HISTORY_KEY, next);

  return next;
}


export function deleteStudyHistoryItem<T>(
  storage: Pick<Storage, "setItem">,
  history: ResearchHistoryItem<T>[],
  id: string,
): ResearchHistoryItem<T>[] {
  const next = history.filter((item) => item.id !== id);
  persistHistory(storage, STUDY_HISTORY_KEY, next);
  return next;
}
