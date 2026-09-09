"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AskBillbliComposer } from "@/components/AskBillbliComposer";
import DecisionBox, { type ResearchResult } from "@/components/DecisionBox";
import { submitResearchWorkspace } from "@/lib/research-workspace-submit";
import {
  createSpeechCommand,
  type SpeechRecognitionLike,
} from "@/lib/speech-command";

type ResearchSubmit = (
  question: string,
) => Promise<ResearchResult>;

export type ResearchWorkspaceSpeechState =
  | "idle"
  | "listening"
  | "transcribing";

export function createResearchWorkspaceSpeechController(
  setState: (state: ResearchWorkspaceSpeechState) => void,
  onTranscript: (transcript: string) => void = () => {},
) {
  return {
    start() {
      setState("listening");
    },

    handleTranscript(transcript: string) {
      setState("transcribing");
      onTranscript(transcript);
    },

    handleEnd() {
      setState("idle");
    },
  };
}

export function createResearchWorkspaceSpeechCallbacks(
  setState: (state: ResearchWorkspaceSpeechState) => void,
  onTranscript: (transcript: string) => void,
) {
  const controller = createResearchWorkspaceSpeechController(
    setState,
    onTranscript,
  );

  return {
    onStartSpeaking: controller.start,
    onTranscript: controller.handleTranscript,
    onEnd: controller.handleEnd,
  };
}

export function createResearchWorkspaceSpeechCommand(
  createRecognition: () => SpeechRecognitionLike,
  onTranscript: (transcript: string) => void,
  onEnd: () => void = () => {},
) {
  return createSpeechCommand(createRecognition, onTranscript, onEnd);
}

export function createResearchWorkspaceTranscriptHandler(
  onChange: (value: string) => void,
) {
  return (transcript: string) => {
    const trimmed = transcript.trim();

    if (!trimmed) {
      return;
    }

    onChange(trimmed);
  };
}

export function createResearchWorkspaceHandler(
  submitResearch: ResearchSubmit,
) {
  return async (question: string) => {
    return submitResearch(question);
  };
}

export function createResearchWorkProposalHandler(
  onCreateWork: (input: { title: string; goal: string }) => void,
) {
  return (input: { title: string; goal: string }) => {
    onCreateWork({
      title: input.title.trim(),
      goal: input.goal.trim(),
    });
  };
}

export async function submitResearchWorkProposal(input: {
  title: string;
  goal: string;
}) {
  const response = await fetch("/api/work", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title.trim(),
      goal: input.goal.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Work.");
  }

  return response.json();
}

export function ResearchWorkProposal({
  result,
  onCreateWork,
}: {
  result: ResearchResult;
  onCreateWork?: (input: { title: string; goal: string }) => void;
}) {
  const initialTitle =
    result.recommendation?.recommendation?.trim() ||
    result.analysis?.decision?.trim() ||
    "Follow up on this decision";

  const initialGoal =
    result.recommendation?.next_steps?.[0]?.trim() ||
    result.analysis?.summary?.trim() ||
    "Continue the recommended next step using the current research evidence.";

  const [title, setTitle] = useState(initialTitle);
  const [goal, setGoal] = useState(initialGoal);

  function handleCreateWork() {
    if (!onCreateWork) {
      return;
    }

    createResearchWorkProposalHandler(onCreateWork)({
      title,
      goal,
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
        Suggested Work
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        BILLBLI suggests turning this recommendation into explicit Work.
        Review and edit the proposal before creating anything.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="work-title"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Work title
          </label>
          <input
            id="work-title"
            name="work-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="work-goal"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Work goal
          </label>
          <textarea
            id="work-goal"
            name="work-goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-zinc-200 px-3 py-3 text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Human review is required before Work is created.
          </p>

          <button
            type="button"
            onClick={handleCreateWork}
            disabled={!onCreateWork || !title.trim() || !goal.trim()}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Work
          </button>
        </div>
      </div>
    </section>
  );
}

export function ResearchWorkspace({
  result: initialResult,
  submitResearch = submitResearchWorkspace,
  onCreateWork,
}: {
  result?: ResearchResult | null;
  submitResearch?: ResearchSubmit;
  onCreateWork?: (input: { title: string; goal: string }) => void;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(
    initialResult ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speakingState, setSpeakingState] =
    useState<ResearchWorkspaceSpeechState>("idle");
  const speechCommandRef = useRef<ReturnType<
    typeof createResearchWorkspaceSpeechCommand
  > | null>(null);

  const speechCallbacks = createResearchWorkspaceSpeechCallbacks(
    setSpeakingState,
    createResearchWorkspaceTranscriptHandler(setQuestion),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    type BrowserSpeechRecognition = SpeechRecognitionLike & {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
    };

    type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    speechCommandRef.current = createResearchWorkspaceSpeechCommand(
      () => recognition,
      speechCallbacks.onTranscript,
      speechCallbacks.onEnd,
    );

    return () => {
      recognition.stop();
      speechCommandRef.current = null;
    };
  }, []);

  function handleStartSpeaking() {
    if (!speechCommandRef.current) {
      return;
    }

    speechCallbacks.onStartSpeaking();
    speechCommandRef.current.start();
  }

  function handleStopSpeaking() {
    if (!speechCommandRef.current) {
      return;
    }

    speechCommandRef.current.stop();
  }

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
        speakingState={speakingState}
        onStartSpeaking={handleStartSpeaking}
        onStopSpeaking={handleStopSpeaking}
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
          <ResearchWorkProposal
            result={result}
            onCreateWork={onCreateWork}
          />
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
