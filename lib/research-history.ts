export interface ResearchHistoryItem<T = unknown> {
  id: string;
  question: string;
  createdAt: string;
  result: T;
}

export function createHistoryItem<T>(question: string, result: T): ResearchHistoryItem<T> {
  return {
    id: crypto.randomUUID(),
    question,
    createdAt: new Date().toISOString(),
    result,
  };
}

type HistoryPreviewResult = {
  analysis?: { decision?: string };
  decision?: { decision?: { recommendation?: string; score?: number; confidence?: number } };
};

export function getHistoryPreview(item: ResearchHistoryItem<HistoryPreviewResult>) {
  const decision = item.result?.decision?.decision;
  return {
    question: item.question,
    decision: decision?.recommendation ?? item.result?.analysis?.decision ?? "Research completed",
    score: decision?.score,
    confidence: decision?.confidence,
  };
}
