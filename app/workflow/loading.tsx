export default function WorkflowLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      <div className="h-32 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />
      <div className="h-[600px] w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60 flex items-center justify-center">
        <span className="font-mono text-xs text-forge-muted">Loading Workflow Graph Studio...</span>
      </div>
    </div>
  );
}
