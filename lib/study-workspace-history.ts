import { saveStudyHistory, STUDY_HISTORY_KEY } from "./study-history";
import { parseHistory, type ResearchHistoryItem } from "./research-history";
import type { StudyResponse } from "./study-response";

export function saveStudyWorkspaceResult(
  storage: Pick<Storage, "setItem">,
  history: ResearchHistoryItem<StudyResponse>[],
  question: string,
  result: StudyResponse,
): ResearchHistoryItem<StudyResponse>[] {
  return saveStudyHistory(storage, history, question, result);
}

export function loadStudyWorkspaceHistory(
  storage: Pick<Storage, "getItem">,
): ResearchHistoryItem<StudyResponse>[] {
  try {
    const saved = storage.getItem(STUDY_HISTORY_KEY);

    if (!saved) {
      return [];
    }

    return parseHistory<StudyResponse>(saved);
  } catch {
    return [];
  }
}
