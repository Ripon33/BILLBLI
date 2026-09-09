"use client";

import { useEffect, useState } from "react";
import {
  deleteResearchHistoryItem,
  getHistoryPreview,
  parseHistory,
  type ResearchHistoryItem,
} from "@/lib/research-history";
import {
  deleteStudyHistoryItem,
  STUDY_HISTORY_KEY,
} from "@/lib/study-history";

const RESEARCH_HISTORY_KEY = "billbli-research-history";

export function createHistoryRestoreHref(
  route: "research" | "study",
  id: string,
): string {
  const params = new URLSearchParams({
    restore: id,
    route,
  });

  return `/workspace?${params.toString()}`;
}

type ResearchHistory = ResearchHistoryItem<Record<string, unknown>>;
type StudyHistory = ResearchHistoryItem<Record<string, unknown>>;

export default function HistoryWorkspace() {
  const [researchHistory, setResearchHistory] = useState<ResearchHistory[]>([]);
  const [studyHistory, setStudyHistory] = useState<StudyHistory[]>([]);

  useEffect(() => {
    try {
      const savedResearch = localStorage.getItem(RESEARCH_HISTORY_KEY);
      if (savedResearch) {
        setResearchHistory(parseHistory<ResearchHistory["result"]>(savedResearch));
      }

      const savedStudy = localStorage.getItem(STUDY_HISTORY_KEY);
      if (savedStudy) {
        setStudyHistory(parseHistory<StudyHistory["result"]>(savedStudy));
      }
    } catch {
      // Ignore malformed local history.
    }
  }, []);


  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Research history
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Review your saved research results. History stays in your existing
            BILLBLI local workspace.
          </p>
        </div>

        <div className="mt-6">
          {researchHistory.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
              No research history yet.
            </p>
          ) : (
            <div className="space-y-2">
              {researchHistory.map((item) => {
                const preview = getHistoryPreview(item);

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4"
                  >
                    <a
                      href={createHistoryRestoreHref("research", item.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="font-medium text-zinc-900">
                        {item.question}
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">
                        {preview.decision}
                      </div>
                    </a>

                    <button
                      type="button"
                      aria-label={`Delete research history: ${item.question}`}
                      onClick={() =>
                        setResearchHistory(
                          deleteResearchHistoryItem(
                            localStorage,
                            researchHistory,
                            item.id,
                          ),
                        )
                      }
                      className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Study history
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Review your saved study sessions from the existing study history.
          </p>
        </div>

        <div className="mt-6">
          {studyHistory.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
              No study history yet.
            </p>
          ) : (
            <div className="space-y-2">
              {studyHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4"
                >
                  <a
                    href={createHistoryRestoreHref("study", item.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="font-medium text-zinc-900">
                      {item.question}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">Study</div>
                  </a>

                  <button
                    type="button"
                    aria-label={`Delete study history: ${item.question}`}
                    onClick={() =>
                      setStudyHistory(
                        deleteStudyHistoryItem(
                          localStorage,
                          studyHistory,
                          item.id,
                        ),
                      )
                    }
                    className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
