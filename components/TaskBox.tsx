"use client";

import type { BillbliTask } from "@/lib/task-engine";
import { getTaskResultMessage } from "@/lib/task-result";

export default function TaskBox({
  task,
}: {
  task: BillbliTask;
}) {
  const message = getTaskResultMessage({
    status:
      task.status === "needs_input" || task.status === "waiting_approval"
        ? task.status
        : "waiting_approval",
    domain: task.domain,
    goal: task.goal,
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-45px_rgba(0,0,0,0.28)]">
      <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-8 text-white lg:px-10 lg:py-10">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Task execution
        </div>

        <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[34px] lg:text-[42px]">
          {message.title}
        </h2>

        <p className="mt-4 max-w-[760px] text-sm leading-6 text-zinc-300">
          {message.description}
        </p>
      </div>

      <div className="space-y-5 px-6 py-7 lg:px-10 lg:py-9">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Task
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-700">
            {task.input}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Domain
            </div>
            <div className="mt-2 text-sm font-semibold capitalize text-zinc-800">
              {task.domain}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Required tool
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-800">
              {task.requiredTools.length
                ? task.requiredTools.join(", ")
                : "None yet"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Status
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-800">
            {task.status.replaceAll("_", " ")}
          </div>
        </div>
      </div>
    </section>
  );
}
