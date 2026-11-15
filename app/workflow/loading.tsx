export default function WorkflowLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        <div className="h-36 w-full rounded-2xl border border-indigo-950/10 bg-white" />
        <div className="h-[600px] w-full rounded-2xl border border-indigo-950/10 bg-white flex items-center justify-center">
          <span className="font-mono text-sm text-indigo-900/60 font-semibold">Loading Workflow Graph Studio...</span>
        </div>
      </div>
    </div>
  );
}
