"use client";

import { useCallback, useState } from "react";
import type { BillbliWork } from "@/lib/work-engine";
import WorkerCreationPanel from "./WorkerCreationPanel";
import WorkerDirectory from "./WorkerDirectory";

export default function WorkerWorkforce() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback((_work: BillbliWork) => {
    setRefreshKey((current) => current + 1);
  }, []);

  return (
    <>
      <WorkerCreationPanel onCreated={handleCreated} />
      <WorkerDirectory key={refreshKey} />
    </>
  );
}
