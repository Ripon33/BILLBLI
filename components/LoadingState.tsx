type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
      />
      <span>{message}</span>
    </div>
  );
}
