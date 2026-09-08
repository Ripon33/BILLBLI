"use client";

import { useId } from "react";
import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode,
} from "react";

export type AskBillbliContextOption = {
  label: string;
  value: string;
};

export type AskBillbliContext = {
  label: string;
  value: string;
  options: AskBillbliContextOption[];
  onChange?: (value: string) => void;
};

export type AskBillbliAttachment = {
  id: string;
  name: string;
};

export type AskBillbliSpeakingState =
  | "idle"
  | "listening"
  | "transcribing";

export function applyAskBillbliTranscript(
  transcript: string,
  onChange: (value: string) => void,
) {
  const trimmed = transcript.trim();

  if (!trimmed) {
    return;
  }

  onChange(trimmed);
}

export function getAskBillbliSpeakingAction(
  state: AskBillbliSpeakingState,
  onStartSpeaking: () => void,
  onStopSpeaking: () => void,
) {
  if (state === "idle") {
    return onStartSpeaking;
  }

  if (state === "listening") {
    return onStopSpeaking;
  }

  return () => {};
}

type AskBillbliComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "full" | "contextual";
  context?: AskBillbliContext;
  footerContent?: ReactNode;
  placeholder?: string;
  attachments?: AskBillbliAttachment[];
  onRemoveAttachment?: (id: string) => void;
  speakingState?: AskBillbliSpeakingState;
  onStartSpeaking?: () => void;
  onStopSpeaking?: () => void;
};

export function shouldSubmitAskBillbliKeyboardEvent(
  event: Pick<
    KeyboardEvent<HTMLTextAreaElement>,
    "key" | "ctrlKey" | "metaKey" | "shiftKey"
  >,
) {
  return (
    event.key === "Enter" &&
    !event.shiftKey &&
    (event.ctrlKey || event.metaKey)
  );
}

export function AskBillbliComposer({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  variant = "full",
  context,
  footerContent,
  placeholder = "What are you deciding?",
  attachments = [],
  onRemoveAttachment,
  speakingState = "idle",
  onStartSpeaking = () => {},
  onStopSpeaking = () => {},
}: AskBillbliComposerProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const submitDisabled = disabled || loading || !value.trim();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    // File persistence/upload is intentionally handled by the workspace.
    // The shared composer currently exposes the selection control only.
    event.currentTarget.value = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!shouldSubmitAskBillbliKeyboardEvent(event) || submitDisabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={onSubmit}
      data-composer-variant={variant}
      aria-busy={loading}
      className={`w-full min-w-0 ${
        variant === "contextual" ? "max-w-3xl" : "max-w-[820px]"
      }`}
    >
      <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <label htmlFor={inputId} className="sr-only">
          Ask BILLBLI
        </label>

        <textarea
          id={inputId}
          name="question"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={variant === "contextual" ? 3 : 4}
          aria-label="Ask BILLBLI"
          aria-describedby={hintId}
          disabled={disabled || loading}
          className="min-h-[96px] w-full resize-none border-0 bg-transparent px-4 py-4 text-base leading-7 text-zinc-950 outline-none placeholder:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[112px] sm:text-lg"
        />

        {attachments.length > 0 && (
          <div
            aria-label="Attachments"
            className="flex flex-wrap gap-2 border-t border-zinc-100 px-3 pt-3"
          >
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-700"
              >
                <span className="min-w-0 max-w-[220px] truncate">
                  {attachment.name}
                </span>

                {onRemoveAttachment && (
                  <button
                    type="button"
                    aria-label={`Remove ${attachment.name}`}
                    onClick={() => onRemoveAttachment(attachment.id)}
                    disabled={disabled || loading}
                    className="shrink-0 text-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <label
              className={[
                "flex cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900",
                disabled || loading
                  ? "cursor-not-allowed opacity-50"
                  : "",
              ].join(" ")}
            >
              <span aria-hidden="true" className="mr-1.5 text-base leading-none">
                +
              </span>
              Attach
              <input
                type="file"
                aria-label="Attach files"
                multiple
                disabled={disabled || loading}
                onChange={handleAttachmentChange}
                className="sr-only"
              />
            </label>

            <span
              id={hintId}
              className="text-xs text-zinc-400"
            >
              {loading
                ? "BILLBLI is researching..."
                : speakingState === "listening"
                  ? "Listening..."
                  : speakingState === "transcribing"
                    ? "Transcribing..."
                    : "Ask a decision, not just a question."}
            </span>

            <button
              type="button"
              aria-label={
                speakingState === "listening"
                  ? "Stop speaking command"
                  : "Use speaking command"
              }
              aria-live="polite"
              disabled={disabled || loading || speakingState === "transcribing"}
              onClick={getAskBillbliSpeakingAction(
                speakingState,
                onStartSpeaking,
                onStopSpeaking,
              )}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true">🎙</span>
              {speakingState === "listening"
                ? "Listening"
                : speakingState === "transcribing"
                  ? "Transcribing"
                  : "Speak"}
            </button>

            {context && (
              <label className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="sr-only">{context.label}</span>
                <select
                  aria-label={context.label}
                  value={context.value}
                  disabled={disabled || loading}
                  onChange={(event) => context.onChange?.(event.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-emerald-500"
                >
                  {context.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {footerContent}
          </div>

          <button
            type="submit"
            disabled={submitDisabled}
            className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? "Researching..." : "Research & Decide →"}
          </button>
        </div>
      </div>
    </form>
  );
}
