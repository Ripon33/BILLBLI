import { notFound } from "next/navigation";
import WorkerWorkspace from "@/components/WorkerWorkspace";
import WorkspaceChrome from "@/components/WorkspaceChrome";
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

  return (
    <WorkspaceChrome>
      <div className="min-h-screen bg-[#f7f7f5] px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto w-full max-w-[1180px]">
          <WorkerWorkspace worker={worker} />
        </div>
      </div>
    </WorkspaceChrome>
  );
}
