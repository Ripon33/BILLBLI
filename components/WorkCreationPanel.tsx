"use client";

import { FormEvent, useState } from "react";

export default function WorkCreationPanel() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedGoal = goal.trim();

    if (!trimmedTitle || !trimmedGoal) {
      setStatus("Title and goal are required.");
      return;
    }

    setStatus("Creating Work...");

    try {
      const response = await fetch("/api/work", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          goal: trimmedGoal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Work.");
      }

      setStatus("Work created.");
      setTitle("");
      setGoal("");
    } catch {
      setStatus("Failed to create Work.");
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          Work Engine
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">
          Create Work
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Turn an objective into a persistent Work item.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Work title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Launch a new printing business"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Work goal
          </span>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Describe the outcome you want BILLBLI to work toward."
            rows={4}
            className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Create Work
        </button>

        {status && (
          <p className="text-sm text-zinc-500" role="status">
            {status}
          </p>
        )}
      </form>
    </section>
  );
}
