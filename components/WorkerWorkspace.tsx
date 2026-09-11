"use client";

import { useState } from "react";
import type { BillbliWork } from "@/lib/work-engine";
import type { ResearchRunnerResult } from "@/lib/research-runner";
import type { AskWorkerWorkProposal } from "@/lib/ask-worker";
import { WORKER_PROFILES } from "@/lib/worker-domain";

type WorkerWorkspaceProps = {
  worker: BillbliWork;
};

export type AskWorkerSubmission = {
  url: string;
  init: {
    method: "POST";
    headers: {
      "content-type": string;
    };
    body: string;
  };
};

export type AskWorkerSubmissionResult = {
  route: "study" | "research" | "task";
  stages: string[];
  answer: string;
  context: {
    workerId: string;
    workerName: string;
    workerType?: BillbliWork["workerType"];
    workerGoal: string;
  };
  governance: {
    recommendationIsAuthorization: false;
    requiresHumanAuthorization: boolean;
    externalExecutionAllowed: false;
  };
  research?: ResearchRunnerResult;
  workProposal?: AskWorkerWorkProposal;
};

export function createAskWorkerSubmission(input: {
  workerId: string;
  message: string;
}): AskWorkerSubmission {
  const message = input.message.trim();

  if (!message) {
    throw new Error("Ask Worker message is required.");
  }

  return {
    url: `/api/work/${input.workerId}/ask`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
  };
}

export function createReviewedWorkInput(input: {
  title: string;
  goal: string;
}) {
  const title = input.title.trim();
  const goal = input.goal.trim();

  if (!title || !goal) {
    throw new Error("Work title and goal are required.");
  }

  return {
    title,
    goal,
  };
}

export function createWorkProposalSubmission(input: {
  title: string;
  goal: string;
}) {
  const title = input.title.trim();
  const goal = input.goal.trim();

  if (!title || !goal) {
    throw new Error("Work title and goal are required.");
  }

  return {
    url: "/api/work",
    init: {
      method: "POST" as const,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        goal,
      }),
    },
  };
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function submitWorkProposal(input: {
  title: string;
  goal: string;
}) {
  const { url, init } = createWorkProposalSubmission(input);
  const response = await fetch(url, init);

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : "Failed to create Work.",
    );
  }

  return body;
}

export function AskWorkerResearchResult({
  research,
}: {
  research: ResearchRunnerResult;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Answer
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-800">
          {research.analysis.summary}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Decision
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-800">
          {research.analysis.decision}
        </p>
      </div>

      {research.analysis.risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Risks
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
            {research.analysis.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {research.analysis.what_would_change_the_decision.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            What would change the decision
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
            {research.analysis.what_would_change_the_decision.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {research.sources.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Evidence
          </p>
          <ul className="mt-2 space-y-2">
            {research.sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AskWorkerWorkProposalReview({
  proposal,
  onCreateWork,
}: {
  proposal: AskWorkerWorkProposal;
  onCreateWork?: (input: { title: string; goal: string }) => void;
}) {
  const [title, setTitle] = useState(proposal.title);
  const [goal, setGoal] = useState(proposal.goal);

  function handleCreateWork() {
    const reviewed = createReviewedWorkInput({ title, goal });
    onCreateWork?.(reviewed);
  }

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
          Work Proposal
        </p>
        <h3 className="mt-1 text-base font-semibold text-zinc-900">
          Review before creating Work
        </h3>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Review and edit the proposed Work before explicitly creating it.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="work-proposal-title"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"
          >
            Work title
          </label>
          <input
            id="work-proposal-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="work-proposal-goal"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"
          >
            Work goal
          </label>
          <textarea
            id="work-proposal-goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={handleCreateWork}
          className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Create Work
        </button>
      </div>
    </div>
  );
}

export type AskWorkerState = {
  status: "idle" | "loading" | "success" | "error";
  result: AskWorkerSubmissionResult | null;
  error: string | null;
};

export function createAskWorkerState(): AskWorkerState;
export function createAskWorkerState(
  result: AskWorkerSubmissionResult,
): AskWorkerState;
export function createAskWorkerState(
  status: "loading",
): AskWorkerState;
export function createAskWorkerState(
  status: "error",
  error: string,
): AskWorkerState;
export function createAskWorkerState(
  input?: AskWorkerSubmissionResult | "loading" | "error",
  error?: string,
): AskWorkerState {
  if (input === "loading") {
    return {
      status: "loading",
      result: null,
      error: null,
    };
  }

  if (input === "error") {
    return {
      status: "error",
      result: null,
      error: error ?? "Unable to process Ask Worker request.",
    };
  }

  if (input) {
    return {
      status: "success",
      result: input,
      error: null,
    };
  }

  return {
    status: "idle",
    result: null,
    error: null,
  };
}

export async function submitAskWorker(input: {
  workerId: string;
  message: string;
}): Promise<AskWorkerSubmissionResult> {
  const submission = createAskWorkerSubmission(input);
  const response = await fetch(submission.url, submission.init);

  if (!response.ok) {
    throw new Error("Unable to process Ask Worker request.");
  }

  return (await response.json()) as AskWorkerSubmissionResult;
}

export default function WorkerWorkspace({
  worker,
}: WorkerWorkspaceProps) {
  const workerType = worker.workerType;
  const profile = workerType ? WORKER_PROFILES[workerType] : undefined;
  const specialization = profile?.displayName ?? "Custom Worker";
  const workerName = worker.workerName ?? worker.title;

  const [message, setMessage] = useState("");
  const [state, setState] = useState<AskWorkerState>(
    createAskWorkerState(),
  );

  async function handleSubmit() {
    if (state.status === "loading") {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setState(
        createAskWorkerState(
          "error",
          "Ask Worker message is required.",
        ),
      );
      return;
    }

    setState(createAskWorkerState("loading"));

    try {
      const result = await submitAskWorker({
        workerId: worker.id,
        message: trimmedMessage,
      });

      setState(createAskWorkerState(result));
      setMessage("");
    } catch (error) {
      setState(
        createAskWorkerState(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to process Ask Worker request.",
        ),
      );
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          AI Workforce
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {workerName}
            </h1>
            <p className="mt-1 text-sm font-medium text-zinc-600">
              {specialization}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              {formatLabel(worker.autonomy)}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              {formatLabel(worker.authorization)}
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Goal
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-700">
            {worker.goal}
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Worker Interaction
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Ask {workerName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Give this worker a request or ask for help within its defined
            professional context.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            aria-label={`Ask ${workerName}`}
            placeholder={`Ask ${workerName}...`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={state.status === "loading"}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={state.status === "loading"}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "Working..." : "Ask Worker"}
          </button>
        </div>

        {state.status === "error" && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        {state.status === "loading" && (
          <div
            aria-live="polite"
            className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="text-sm font-medium text-zinc-800">
              {workerName} is working through your request…
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              BILLBLI is routing the request through the governed workflow.
            </p>
          </div>
        )}

        {state.status === "success" && state.result && (
          <div
            aria-live="polite"
            className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                  Worker Response
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  Route: {formatLabel(state.result.route)}
                </p>
              </div>

              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                Governed
              </span>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Answer
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-800">
                {state.result.answer}
              </p>
            </div>

            {state.result.research && (
              <div className="mt-5 border-t border-zinc-200 pt-5">
                <AskWorkerResearchResult research={state.result.research} />
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Progress
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {state.result.stages.map((stage) => (
                  <span
                    key={stage}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600"
                  >
                    {formatLabel(stage)}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-zinc-500">
              AI recommendations are not authorization. Any human decision,
              approval, or execution remains subject to BILLBLI governance.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
