import { notFound } from "next/navigation";
import WorkerWorkspace from "@/components/WorkerWorkspace";
import { createWorkRepository } from "@/lib/work-repository";

type WorkerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkerPage({ params }: WorkerPageProps) {
  const { id } = await params;
  const repository = createWorkRepository();
  const worker = await repository.getWork(id);

  if (
    !worker ||
    (worker.workerType === undefined && worker.workerName === undefined)
  ) {
    notFound();
  }

  return <WorkerWorkspace worker={worker} />;
}
