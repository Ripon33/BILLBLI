import {
  deleteResearchHistoryItem,
  type ResearchHistoryItem,
} from "./research-history";
import {
  deleteStudyHistoryItem,
} from "./study-history";
import type { StudyResponse } from "./study-response";

type CurrentResultDeleteInput<ResearchResult> = {
  route: "research" | "study";
  id: string;
  history: ResearchHistoryItem<ResearchResult>[];
  studyHistory: ResearchHistoryItem<StudyResponse>[];
  storage: Pick<Storage, "setItem">;
};

type CurrentResultDeleteState<ResearchResult> = {
  history: ResearchHistoryItem<ResearchResult>[];
  studyHistory: ResearchHistoryItem<StudyResponse>[];
  result: null;
  question: string;
};

export function deleteCurrentResult<ResearchResult>({
  route,
  id,
  history,
  studyHistory,
  storage,
}: CurrentResultDeleteInput<ResearchResult>): CurrentResultDeleteState<ResearchResult> {
  if (route === "research") {
    return {
      history: deleteResearchHistoryItem(storage, history, id),
      studyHistory,
      result: null,
      question: "",
    };
  }

  return {
    history,
    studyHistory: deleteStudyHistoryItem(storage, studyHistory, id),
    result: null,
    question: "",
  };
}
