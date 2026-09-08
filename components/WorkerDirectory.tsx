"use client";

import { useEffect, useState } from "react";
import type { BillbliWork } from "@/lib/work-engine";
import WorkerList from "./WorkerList";

export default function WorkerDirectory() {
  const [workers, setWorkers] = useState<BillbliWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWorkers() {
      try {
        const response = await fetch("/api/work", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load workers.");
        }

        const data = (await response.json()) as {
          works?: BillbliWork[];
        };

        if (active) {
          const persistedWorkers = (data.works ?? []).filter(
            (work) => work.workerType !== undefined || work.workerName !== undefined,
          );

          setWorkers(persistedWorkers);
          setError("");
        }
      } catch {
        if (active) {
          setError("Unable to load workers.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWorkers();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm font-semibold text-zinc-900">
          Your workers
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Loading workers...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm font-semibold text-zinc-900">
          Your workers
        </p>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
      </section>
    );
  }

  return <WorkerList workers={workers} />;
}
