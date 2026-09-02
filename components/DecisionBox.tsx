"use client";

import { useState } from "react";

export type Source = {
  title?: string;
  url?: string;
  score?: number | null;
  authority?: string;
  authority_type?: string;
  content?: string;
};

type Analysis = {
  decision?: string;
  confidence?: number;
  summary?: string;
  key_facts?: { fact: string; sources?: number[] }[];
  evidence_for?: { point: string; sources?: number[] }[];
  evidence_against?: { point: string; sources?: number[] }[];
  risks?: string[];
  assumptions?: string[];
  conflicts?: string[];
  what_would_change_the_decision?: string[];
};

export type ResearchResult = {
  question?: string;
  analysis?: Analysis;
  sources?: Source[];
};

function Section({
  number,
  label,
  count,
  children,
}: {
  number: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border-b border-zinc-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-zinc-400">
            {number}
          </span>
          <span className="text-sm font-semibold">{label}</span>
          {typeof count === "number" && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
              {count}
            </span>
          )}
        </div>

        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="pb-6">{children}</div>}
    </section>
  );
}

function PointList({
  items,
  tone,
}: {
  items?: { point: string; sources?: number[] }[];
  tone: "positive" | "negative";
}) {
  if (!items?.length) {
    return (
      <p className="text-sm text-zinc-400">
        No material evidence listed.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              tone === "positive" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />

          <div>
            <div className="text-sm leading-6 text-zinc-700">
              {item.point}
            </div>

            {item.sources?.length ? (
              <div className="mt-2 text-[10px] font-medium text-zinc-400">
                Sources {item.sources.join(", ")}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleList({ items }: { items?: string[] }) {
  if (!items?.length) {
    return (
      <p className="text-sm text-zinc-400">
        Nothing material listed.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3 text-sm leading-6 text-zinc-700">
          <span className="font-mono text-[10px] text-zinc-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function DecisionBox({
  result,
}: {
  result: ResearchResult;
}) {
  const analysis = result.analysis || {};
  const sources = result.sources || [];
  const confidence = Math.max(
    0,
    Math.min(100, Math.round(analysis.confidence ?? 0))
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-45px_rgba(0,0,0,0.28)]">
      {/* DECISION HEADER */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-8 text-white lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-[930px]">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Decision intelligence
            </div>

            <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[34px] lg:text-[42px]">
              {analysis.decision ||
                "The research does not support a definitive decision yet."}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-5 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                Confidence
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {confidence}%
              </div>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div className="max-w-[90px] text-[10px] leading-4 text-zinc-400">
              Evidence strength
            </div>
          </div>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid border-b border-zinc-200 sm:grid-cols-3">
        <div className="border-b border-zinc-200 px-6 py-5 sm:border-b-0 sm:border-r lg:px-8">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Sources reviewed
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {sources.length}
          </div>
        </div>

        <div className="border-b border-zinc-200 px-6 py-5 sm:border-b-0 sm:border-r lg:px-8">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Evidence confidence
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-sm font-semibold">
              {confidence}%
            </span>
          </div>
        </div>

        <div className="px-6 py-5 lg:px-8">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Research mode
          </div>
          <div className="mt-1 text-sm font-semibold">
            Evidence-first
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="grid border-b border-zinc-200 lg:grid-cols-[1fr_300px]">
        <div className="px-6 py-8 lg:px-10 lg:py-9">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Executive summary
          </div>

          <p className="mt-4 max-w-[850px] text-[16px] leading-8 text-zinc-700">
            {analysis.summary ||
              "The research model did not provide an executive summary."}
          </p>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-8 lg:border-l lg:border-t-0 lg:px-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Decision signal
          </div>

          <div className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
            {confidence}%
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Reflects the strength, relevance and consistency of the
            evidence gathered for this decision.
          </p>
        </div>
      </div>

      {/* EVIDENCE */}
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-zinc-200 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-9">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold">
                  Evidence supporting
                </h3>
              </div>

              <p className="mt-1 text-xs text-zinc-400">
                For the recommendation
              </p>
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {analysis.evidence_for?.length ?? 0} points
            </span>
          </div>

          <PointList
            items={analysis.evidence_for}
            tone="positive"
          />
        </div>

        <div className="px-6 py-8 lg:px-10 lg:py-9">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-sm font-semibold">
                  Evidence against
                </h3>
              </div>

              <p className="mt-1 text-xs text-zinc-400">
                Reasons for caution
              </p>
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              {analysis.evidence_against?.length ?? 0} points
            </span>
          </div>

          <PointList
            items={analysis.evidence_against}
            tone="negative"
          />
        </div>
      </div>

      {/* DECISION DETAILS */}
      <div className="border-t border-zinc-200 px-6 lg:px-10">
        <Section
          number="01"
          label="Key facts"
          count={analysis.key_facts?.length}
        >
          <div className="space-y-4">
            {analysis.key_facts?.length ? (
              analysis.key_facts.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-xl bg-zinc-50 px-4 py-4"
                >
                  <span className="font-mono text-[10px] text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-6 text-zinc-700">
                    {item.fact}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No key facts listed.
              </p>
            )}
          </div>
        </Section>

        <Section
          number="02"
          label="Risks & constraints"
          count={analysis.risks?.length}
        >
          <SimpleList items={analysis.risks} />
        </Section>

        <Section
          number="03"
          label="Assumptions"
          count={analysis.assumptions?.length}
        >
          <SimpleList items={analysis.assumptions} />
        </Section>

        <Section
          number="04"
          label="Conflicting evidence"
          count={analysis.conflicts?.length}
        >
          <SimpleList items={analysis.conflicts} />
        </Section>
      </div>

      {/* WHAT CHANGES DECISION */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Decision control
          </div>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
            What would change the decision?
          </h3>

          <p className="mt-2 max-w-[650px] text-sm leading-6 text-zinc-500">
            These are the conditions worth watching before acting on
            the recommendation.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {analysis.what_would_change_the_decision?.length ? (
            analysis.what_would_change_the_decision.map(
              (item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 bg-white p-5"
                >
                  <div className="mb-3 font-mono text-[10px] text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <p className="text-sm leading-6 text-zinc-700">
                    {item}
                  </p>
                </div>
              )
            )
          ) : (
            <p className="text-sm text-zinc-400">
              No reassessment triggers listed.
            </p>
          )}
        </div>
      </div>

      {/* SOURCES */}
      <div className="border-t border-zinc-200 px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Research trail
            </div>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
              Sources reviewed
            </h3>
          </div>

          <span className="text-xs text-zinc-400">
            {sources.length} sources
          </span>
        </div>

        <div className="grid gap-2">
          {sources.map((source, index) => (
            <a
              key={`${source.url}-${index}`}
              href={source.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              <span className="w-7 shrink-0 font-mono text-[10px] text-zinc-400">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-medium text-zinc-800 group-hover:text-zinc-950">
                  {source.title || "Untitled source"}
                </div>

                <div className="mt-1 line-clamp-1 text-[10px] text-zinc-400">
                  {source.url || "No URL available"}
                </div>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-400">
                  Authority
                </div>

                <div className="mt-1 text-xs font-semibold text-zinc-700">
                  {typeof source.authority === "number"
                    ? `${Math.round(source.authority)}`
                    : "—"}
                </div>
              </div>

              <span className="text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-600">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
