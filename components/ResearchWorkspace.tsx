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
