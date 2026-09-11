import WorkspaceChrome from "./WorkspaceChrome";

type WorkspaceDestinationProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function WorkspaceDestination({
  eyebrow = "BILLBLI",
  title,
  description,
  children,
}: WorkspaceDestinationProps) {
  return (
    <WorkspaceChrome>
      <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto w-full max-w-[1180px]">
          <header className="mb-8 border-b border-zinc-200 pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              {eyebrow}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-zinc-950">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </header>

          {children}
        </div>
      </main>
    </WorkspaceChrome>
  );
}
