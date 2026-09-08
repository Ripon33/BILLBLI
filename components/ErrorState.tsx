import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-red-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{message}</p>
      {action && <div className="mt-4 flex flex-wrap gap-2">{action}</div>}
    </section>
  );
}
