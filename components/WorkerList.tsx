import Link from "next/link";
import type { BillbliWork } from "@/lib/work-engine";
import { WORKER_PROFILES } from "@/lib/worker-domain";

type WorkerListProps = {
  workers: BillbliWork[];
};

export default function WorkerList({ workers }: WorkerListProps) {
  if (workers.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Persistent Work
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Your workers
          </h2>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-zinc-900">
            No AI workers yet
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Create your first persistent worker to start building your AI
            workforce.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
          Persistent Work
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900">
          Your workers
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {workers.map((worker) => {
          const profile = worker.workerType
            ? WORKER_PROFILES[worker.workerType]
            : undefined;

          return (
            <article
              key={worker.id}
              className="rounded-xl border border-zinc-200 p-4"
            >
              <h3 className="font-semibold text-zinc-900">
                <Link
                  href={`/workspace/workers/${worker.id}`}
                  className="hover:underline"
                >
                  {worker.workerName ?? worker.title}
                </Link>
              </h3>

              <p className="mt-1 text-sm font-medium text-zinc-600">
                {profile?.displayName ?? "Custom Worker"}
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {worker.goal}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
