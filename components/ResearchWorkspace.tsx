"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AskBillbliComposer } from "@/components/AskBillbliComposer";
import DecisionBox, { type ResearchResult } from "@/components/DecisionBox";
import { submitResearchWorkspace } from "@/lib/research-workspace-submit";

type ResearchSubmit = (
  question: string,
) => Promise<ResearchResult>;

export function createResearchWorkspaceHandler(
  submitResearch: ResearchSubmit,
) {
  return async (question: string) => {
    return submitResearch(question);
  };
}

export function ResearchWorkspace({
  result: initialResult,
  submitResearch = submitResearchWorkspace,
}: {
  result?: ResearchResult | null;
  submitResearch?: ResearchSubmit;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(
    initialResult ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = question.trim();

    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const researchResult = await createResearchWorkspaceHandler(
        submitResearch,
      )(trimmed);

      setResult(researchResult);
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
          <DecisionBox result={result} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-3 text-xs text-zinc-500 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Research</div>
          <div className="mt-1 text-zinc-400">Multiple sources</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Verify</div>
          <div className="mt-1 text-zinc-400">Evidence & conflicts</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="font-semibold text-zinc-800">Decide</div>
          <div className="mt-1 text-zinc-400">Clear recommendation</div>
        </div>
      </div>
    </section>
  );
}
