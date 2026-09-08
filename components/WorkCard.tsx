import type { ReactNode } from "react";
import type { BillbliWork } from "@/lib/work-engine";
import { WorkStatus } from "./WorkStatus";

type WorkCardProps = {
  work: BillbliWork;
  actions?: ReactNode;
};

const priorityLabels = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
} as const;

const autonomyLabels = {
  auto: "Auto",
  review: "Review",
  approval: "Approval",
  restricted: "Restricted",
} as const;

const authorizationLabels = {
  not_required: "Not required",
  required: "Required",
  authorized: "Authorized",
} as const;

export function WorkCard({ work, actions }: WorkCardProps) {
  return (
    <article
      data-work-id={work.id}
      className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold text-zinc-950">
              {work.title}
            </h3>
            <p className="mt-1 break-words text-sm leading-6 text-zinc-500">
              {work.goal}
            </p>
          </div>

          <div className="shrink-0">
            <WorkStatus status={work.status} />
          </div>
        </div>

        <dl className="grid min-w-0 grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="min-w-0">
            <dt className="text-zinc-400">Priority</dt>
            <dd className="mt-1 font-medium text-zinc-700">
              {priorityLabels[work.priority]}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-zinc-400">Autonomy</dt>
            <dd className="mt-1 font-medium text-zinc-700">
              {autonomyLabels[work.autonomy]}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-zinc-400">Authorization</dt>
            <dd className="mt-1 font-medium text-zinc-700">
              {authorizationLabels[work.authorization]}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-zinc-400">Work ID</dt>
            <dd className="mt-1 truncate font-medium text-zinc-700">
              {work.id}
            </dd>
          </div>
        </dl>

        {actions && (
          <div className="flex min-w-0 flex-wrap gap-2 border-t border-zinc-100 pt-4">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
