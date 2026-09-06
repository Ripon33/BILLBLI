import type { ReactNode } from "react";
import { getResultActionBar, type ResultRoute } from "@/lib/result-actions";

type ResultActionsProps = {
  route: ResultRoute;
  onDownload: () => void;
  onShare: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onCopy: () => void;
};

const actionHandlers = {
  Download: "onDownload",
  Share: "onShare",
  Print: "onPrint",
  Delete: "onDelete",
  Copy: "onCopy",
} as const;

export function ResultActions({
  route,
  onDownload,
  onShare,
  onPrint,
  onDelete,
  onCopy,
}: ResultActionsProps) {
  const handlers = {
    onDownload,
    onShare,
    onPrint,
    onDelete,
    onCopy,
  };

  const icons: Record<string, ReactNode> = {
    Download: "↓",
    Share: "↗",
    Print: "⎙",
    Delete: "×",
    Copy: "□",
  };

  return (
    <div
      data-result-route={route}
      className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4"
    >
      {getResultActionBar(route).map((label) => {
        const handlerName = actionHandlers[label as keyof typeof actionHandlers];

        return (
          <button
            key={label}
            type="button"
            onClick={handlers[handlerName]}
            aria-label={label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <span aria-hidden="true">{icons[label]}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
