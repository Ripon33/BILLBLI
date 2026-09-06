"use client";

import { FormEvent, useEffect, useState } from "react";
import DecisionBox from "@/components/DecisionBox";
import StudyBox from "@/components/StudyBox";
import type { StudyResponse } from "@/lib/study-response";
import { createHistoryItem, getHistoryPreview, parseHistory } from "@/lib/research-history";
import { createResearchRequest } from "@/lib/research-request";
import { classifyIntent } from "@/lib/intent-engine";
import { getAnswerRoute } from "@/lib/answer-routing";
import { shouldUseWebResearch } from "@/lib/research-routing";

type Source = {
  title?: string;
  url?: string;
  score?: number | null;
  authority?: string;
  authority_type?: string;
};

type ResearchResult = {
  question?: string;
  analysis?: {
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
  sources?: Source[];
};

type HistoryItem = {
  id: string;
  question: string;
  createdAt: string;
  result: ResearchResult;
};

const HISTORY_KEY = "billbli-research-history";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ResearchResult | StudyResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [answerRoute, setAnswerRoute] = useState<"study" | "research">("research");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(parseHistory<ResearchResult>(saved));
    } catch {
      // Ignore malformed local history.
    }
  }, []);

    useEffect(() => {
      if (!loading) return;

      const stepCount = answerRoute === "study" ? 4 : 5;

      const timer = window.setInterval(() => {
        setLoadingStep((current) =>
          current < stepCount - 1 ? current + 1 : current
        );
      }, 1200);

      return () => window.clearInterval(timer);
    }, [loading, answerRoute]);

  function saveHistory(nextQuestion: string, nextResult: ResearchResult) {
    const item: HistoryItem = createHistoryItem(nextQuestion, nextResult);

    const next = [
      item,
      ...history.filter(
        (item) => item.question.toLowerCase() !== nextQuestion.toLowerCase()
      ),
    ].slice(0, 12);

    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const classification = classifyIntent(trimmed);
    const route = getAnswerRoute(trimmed, classification);

    setAnswerRoute(route);
    setLoadingStep(0);
    setLoadingStep(0);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const researchRequest = createResearchRequest(trimmed);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(researchRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Research failed.");
      }

      setResult(data);
      if (route === "research") saveHistory(trimmed, data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewResearch() {
    setQuestion("");
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadHistory(item: HistoryItem) {
    setQuestion(item.question);
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
          }`}
        >
          <div className="flex h-[76px] items-center border-b border-zinc-200 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lg font-bold text-white">
                B
              </div>
              <div>
                <div className="text-[16px] font-bold tracking-[-0.02em]">
                  BILLBLI
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Decision intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={startNewResearch}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                New research
              </span>
              <kbd className="rounded-md border border-white/20 px-2 py-1 text-[10px] font-medium text-zinc-300">
                ⌘ K
              </kbd>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Recent research
            </div>

            {history.length === 0 ? (
              <div className="px-2 py-6 text-xs leading-5 text-zinc-400">
                Your completed research will appear here.
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistory(item)}
                    className="group w-full rounded-xl px-3 py-3 text-left transition hover:bg-zinc-50"
                  >
                    <div className="line-clamp-2 text-sm font-medium leading-5 text-zinc-800">
                      {item.question}
                    </div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                      {getHistoryPreview(item).decision}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 p-4">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Research deeper.</span>
              <span>Decide better.</span>
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/10 lg:hidden"
          />
        )}

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* TOP BAR */}
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-zinc-200 bg-white/90 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((value) => !value)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm lg:hidden"
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <span className="text-sm font-medium text-zinc-400">
                Research workspace
              </span>
            </div>

            <button
              onClick={startNewResearch}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              + New research
            </button>
          </header>

          {/* CONTENT */}
          <div className="mx-auto w-full max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
            {!result && !loading ? (
              <section className="mx-auto max-w-[820px] pt-12 md:pt-20">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Evidence-first research
                </div>

                <h1 className="max-w-[760px] text-4xl font-bold tracking-[-0.045em] md:text-6xl">
                  Research deeper.
                  <br />
                  Decide better.
                </h1>

                <p className="mt-6 max-w-[650px] text-base leading-7 text-zinc-500 md:text-lg">
                  BILLBLI researches the evidence behind important questions,
                  weighs competing signals, and turns them into a decision you
                  can understand.
                </p>

                <form onSubmit={handleSubmit} className="mt-10">
                  <div className="rounded-2xl border border-zinc-300 bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                    <textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="What are you deciding?"
                      rows={4}
                      className="w-full resize-none border-0 bg-transparent px-4 py-3 text-lg outline-none placeholder:text-zinc-300"
                    />

                    <div className="flex items-center justify-between border-t border-zinc-100 px-3 pt-3">
                      <span className="text-xs text-zinc-400">
                        Ask a decision, not just a question.
                      </span>

                      <button
                        type="submit"
                        disabled={!question.trim()}
                        className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Research & Decide →
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-8 grid grid-cols-1 gap-3 text-xs text-zinc-500 sm:grid-cols-3">
                  <Feature label="Research" value="Multiple sources" />
                  <Feature label="Verify" value="Evidence & conflicts" />
                  <Feature label="Decide" value="Clear recommendation" />
                </div>
              </section>
            ) : loading ? (
              <section className="mx-auto max-w-[820px] pt-24">
                <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {answerRoute === "study"
                    ? "Study in progress"
                    : "Research in progress"}
                </div>

                <h1 className="text-3xl font-bold tracking-[-0.035em] md:text-5xl">
                  {answerRoute === "study"
                    ? "Building your learning response."
                    : "Building your decision brief."}
                </h1>

                <div className="mt-10 space-y-3">
                  {answerRoute === "study" ? (
                    <>
                      <ProgressRow index={0} activeStep={loadingStep} label="Understanding your learning goal" />
                      <ProgressRow index={1} activeStep={loadingStep} label="Structuring the explanation" />
                      <ProgressRow index={2} activeStep={loadingStep} label="Building examples" />
                      <ProgressRow index={3} activeStep={loadingStep} label="Preparing practice questions" />
                    </>
                  ) : (
                    <>
                      <ProgressRow index={0} activeStep={loadingStep} label="Understanding your question" />
                      <ProgressRow index={1} activeStep={loadingStep} label="Finding relevant evidence" />
                      <ProgressRow index={2} activeStep={loadingStep} label="Comparing supporting and conflicting signals" />
                      <ProgressRow index={3} activeStep={loadingStep} label="Checking risks and uncertainty" />
                      <ProgressRow index={4} activeStep={loadingStep} label="Building your recommendation" />
                    </>
                  )}
                </div>
              </section>
            ) : (
              <>
                <div className="mb-8 flex items-end justify-between gap-6 border-b border-zinc-200 pb-8">
                  <div>
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Decision workspace
                    </div>

                    <h1 className="max-w-[850px] text-3xl font-bold tracking-[-0.04em] md:text-5xl">
                      {question}
                    </h1>
                  </div>

                  <button
                    onClick={startNewResearch}
                    className="hidden shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold md:block"
                  >
                    Start another
                  </button>
                </div>

                {result && "type" in result && result.type === "study" ? (
                    <StudyBox result={result as StudyResponse} />
                  ) : (
                    <DecisionBox result={result as ResearchResult} />
                  )}
              </>
            )}

            {error && (
              <div className="mx-auto mt-8 max-w-[820px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-6 text-[11px] text-zinc-400 md:px-8">
              <span>© {new Date().getFullYear()} BILLBLI</span>
              <span>Evidence-first decision intelligence</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Feature({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="font-semibold text-zinc-800">{label}</div>
      <div className="mt-1 text-zinc-400">{value}</div>
    </div>
  );
}

function ProgressRow({
  label,
  index,
  activeStep,
}: {
  label: string;
  index: number;
  activeStep: number;
}) {
  const completed = index < activeStep;
  const active = index === activeStep;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-4 transition-all duration-500 ${
        active
          ? "border-emerald-200 bg-emerald-50/60 shadow-sm"
          : completed
            ? "border-zinc-200 bg-white"
            : "border-zinc-100 bg-zinc-50/60"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
          completed
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50"
              : "bg-zinc-100 text-zinc-400"
        }`}
      >
        {completed ? "✓" : active ? "•" : index + 1}
      </span>

      <span
        className={`text-sm transition-colors duration-500 ${
          active
            ? "font-semibold text-zinc-800"
            : completed
              ? "text-zinc-600"
              : "text-zinc-400"
        }`}
      >
        {label}
      </span>

      {active && (
        <span className="ml-auto flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
        </span>
      )}
    </div>
  );
}