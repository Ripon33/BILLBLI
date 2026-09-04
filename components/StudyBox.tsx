"use client";

import type { StudyResponse } from "@/lib/study-response";

export default function StudyBox({ result }: { result: StudyResponse }) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Explanation
        </div>

        <div className="text-[16px] leading-8 text-zinc-700 whitespace-pre-wrap">
          {result.explanation}
        </div>
      </div>

      {result.examples.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Examples
          </div>

          <div className="space-y-3">
            {result.examples.map((example, index) => (
              <div
                key={`${index}-${example}`}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700"
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.practiceQuestions.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Test your understanding
          </div>

          <div className="space-y-3">
            {result.practiceQuestions.map((question, index) => (
              <div
                key={`${index}-${question}`}
                className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                  {index + 1}
                </span>

                <div className="pt-0.5 text-sm leading-7 text-zinc-700">
                  {question}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
