import type { BillbliWork } from "@/lib/work-engine";
import { WORKER_PROFILES } from "@/lib/worker-domain";

type WorkerWorkspaceProps = {
  worker: BillbliWork;
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function WorkerWorkspace({
  worker,
}: WorkerWorkspaceProps) {
  const workerType = worker.workerType;
  const profile = workerType ? WORKER_PROFILES[workerType] : undefined;
  const specialization = profile?.displayName ?? "Custom Worker";
  const workerName = worker.workerName ?? worker.title;

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          AI Workforce
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {workerName}
            </h1>
            <p className="mt-1 text-sm font-medium text-zinc-600">
              {specialization}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              {formatLabel(worker.autonomy)}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              {formatLabel(worker.authorization)}
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Goal
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-700">
            {worker.goal}
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Worker Interaction
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Ask {workerName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Give this worker a request or ask for help within its defined
            professional context.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            aria-label={`Ask ${workerName}`}
            placeholder={`Ask ${workerName}...`}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500"
          />
          <button
            type="button"
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Ask Worker
          </button>
        </div>
      </section>
    </section>
  );
}
