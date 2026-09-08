"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AskBillbliComposer } from "@/components/AskBillbliComposer";
import StudyBox from "@/components/StudyBox";
import type { StudyResponse } from "@/lib/study-response";
import { submitResearchWorkspace } from "@/lib/research-workspace-submit";
import {
  loadStudyWorkspaceHistory,
  saveStudyWorkspaceResult,
} from "@/lib/study-workspace-history";
import type { ResearchHistoryItem } from "@/lib/research-history";

type StudySubmit = (question: string) => Promise<StudyResponse>;

export function createStudyWorkspaceHistoryLoader(
  storage: Pick<Storage, "getItem">,
) {
  return () => loadStudyWorkspaceHistory(storage);
}

export function createStudyWorkspaceHandler(
  submitStudy: StudySubmit,
  saveHistory?: (question: string, result: StudyResponse) => void,
) {
  return async (question: string) => {
    const result = await submitStudy(question);

    saveHistory?.(question, result);

    return result;
  };
}

export function StudyWorkspace({
  result: initialResult,
  submitStudy = submitResearchWorkspace,
}: {
  result?: StudyResponse | null;
  submitStudy?: StudySubmit;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<StudyResponse | null>(
    initialResult ?? null,
  );
  const [studyHistory, setStudyHistory] = useState<
    ResearchHistoryItem<StudyResponse>[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStudyHistory(createStudyWorkspaceHistoryLoader(localStorage)());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = question.trim();

    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const studyResult = await createStudyWorkspaceHandler(
        submitStudy,
        (savedQuestion, savedResult) => {
          const next = saveStudyWorkspaceResult(
            localStorage,
            studyHistory,
            savedQuestion,
            savedResult,
          );

          setStudyHistory(next);
        },
      )(trimmed);

      setResult(studyResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-[820px]">
      <AskBillbliComposer
        value={question}
        onChange={setQuestion}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <StudyBox result={result} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-3 text-xs text-zinc-500 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Learn</div>
          <div className="mt-1 text-zinc-400">Clear explanations</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Examples</div>
          <div className="mt-1 text-zinc-400">Practical understanding</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Practice</div>
          <div className="mt-1 text-zinc-400">Questions to reinforce learning</div>
        </div>
      </div>
    </section>
  );
}
