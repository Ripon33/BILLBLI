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
}: AskBillbliComposerProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const submitDisabled = disabled || loading || !value.trim();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
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

        <div className="flex flex-col gap-3 border-t border-zinc-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              id={hintId}
              className="text-xs text-zinc-400"
            >
              {loading
                ? "BILLBLI is researching..."
                : "Ask a decision, not just a question."}
            </span>

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
