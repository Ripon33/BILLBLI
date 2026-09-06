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

export function parseHistory<T = unknown>(saved: string): ResearchHistoryItem<T>[] {
  try {
    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is ResearchHistoryItem<T> =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as ResearchHistoryItem<T>).id === "string" &&
          typeof (item as ResearchHistoryItem<T>).question === "string" &&
          (item as ResearchHistoryItem<T>).question.trim().length > 0 &&
          typeof (item as ResearchHistoryItem<T>).createdAt === "string" &&
          !Number.isNaN(Date.parse((item as ResearchHistoryItem<T>).createdAt)),
      )
      .slice(0, 12);
  } catch {
    return [];
  }
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
