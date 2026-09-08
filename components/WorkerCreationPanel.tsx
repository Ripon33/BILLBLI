"use client";

import { useState } from "react";
import { WORKER_PROFILES, type WorkerType } from "@/lib/worker-domain";
import type { BillbliWork, WorkAutonomy } from "@/lib/work-engine";

const workerTypes = Object.keys(WORKER_PROFILES) as WorkerType[];

type WorkerCreationPanelProps = {
  onCreated?: (work: BillbliWork) => void;
};

export default function WorkerCreationPanel({
  onCreated,
}: WorkerCreationPanelProps) {
  const [workerType, setWorkerType] = useState<WorkerType>("research_analyst");
  const [workerName, setWorkerName] = useState("");
  const [goal, setGoal] = useState("");
  const [autonomy, setAutonomy] = useState<WorkAutonomy>("review");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating worker...");

    try {
      const response = await fetch("/api/work", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerType,
          workerName,
          goal,
          autonomy,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create worker");
      }

      const data = (await response.json()) as {
        work?: BillbliWork;
      };

      if (!data.work) {
        throw new Error("Created worker was not returned.");
      }

      onCreated?.(data.work);

      setStatus("Worker created successfully.");
      setWorkerName("");
      setGoal("");
    } catch {
      setStatus("Unable to create worker.");
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          AI Workforce
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">
          Create AI Worker
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Create a persistent specialized worker with a clear professional
          goal and explicit autonomy control.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="worker-specialization"
            className="text-sm font-medium text-zinc-800"
          >
            Specialization
          </label>

          <select
            id="worker-specialization"
            value={workerType}
            onChange={(event) =>
              setWorkerType(event.target.value as WorkerType)
            }
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          >
            {workerTypes.map((type) => (
              <option key={type} value={type}>
                {WORKER_PROFILES[type].displayName}
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm leading-5 text-zinc-500">
            {WORKER_PROFILES[workerType].description}
          </p>
        </div>

        <div>
          <label
            htmlFor="worker-name"
            className="text-sm font-medium text-zinc-800"
          >
            Worker name
          </label>
          <input
            id="worker-name"
            type="text"
            value={workerName}
            onChange={(event) => setWorkerName(event.target.value)}
            placeholder="e.g. Maya"
            required
            className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="worker-goal"
            className="text-sm font-medium text-zinc-800"
          >
            Goal
          </label>
          <textarea
            id="worker-goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="What should this worker help you accomplish?"
            required
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="worker-autonomy"
            className="text-sm font-medium text-zinc-800"
          >
            Autonomy
          </label>
          <select
            id="worker-autonomy"
            value={autonomy}
            onChange={(event) =>
              setAutonomy(event.target.value as WorkAutonomy)
            }
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          >
            <option value="auto">Auto</option>
            <option value="review">Review</option>
            <option value="approval">Approval</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="text-sm text-zinc-500"
          >
            {status}
          </p>

          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Create Worker
          </button>
        </div>
      </form>
    </section>
  );
}
