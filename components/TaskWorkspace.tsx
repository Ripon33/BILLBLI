"use client";

import { useState } from "react";
import { routeTask } from "@/lib/task-routing";
import type { BillbliTask } from "@/lib/task-engine";
import { getTaskResultMessage } from "@/lib/task-result";
import TaskBox from "@/components/TaskBox";

export type TaskWorkspaceModel = {
  task: BillbliTask;
  governance: {
    executionAllowed: false;
    requiresApproval: boolean;
  };
};

export function createTaskWorkspaceModel(input: string): TaskWorkspaceModel {
  const result = routeTask(input);

  return {
    task: result.task,
    governance: {
      executionAllowed: false,
      requiresApproval: result.task.approvalRequired,
    },
  };
}

export default function TaskWorkspace() {
  const [input, setInput] = useState("");
  const [task, setTask] = useState<BillbliTask | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      setError("Describe the task you want BILLBLI to handle.");
      return;
    }

    try {
      const model = createTaskWorkspaceModel(trimmed);
      setTask(model.task);
      setError("");
    } catch {
      setError("BILLBLI could not create the task.");
    }
  }

  const resultMessage =
    task && (task.status === "needs_input" || task.status === "waiting_approval")
      ? getTaskResultMessage({
          status: task.status,
          domain: task.domain,
          goal: task.goal,
        })
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Create a task
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Describe what you want BILLBLI to help with. The existing task
            engine will classify the request and determine whether input or
            approval is required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: Research the evidence about climate change."
            rows={4}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Create task
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>

      {task && (
        <section className="space-y-4">
          <TaskBox task={task} />

          {resultMessage && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-base font-semibold text-zinc-900">
                {resultMessage.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {resultMessage.description}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-zinc-900">
              Human-controlled execution
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Creating this task does not execute anything automatically.
              Approval-gated work remains subject to the existing BILLBLI
              governance rules.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
