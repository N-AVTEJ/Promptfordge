export default function EvaluateLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Evaluate Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 rounded bg-white/[0.06]" />
        <div className="h-8 w-72 rounded bg-white/[0.08]" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.04]" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-44 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 p-5 space-y-3"
          >
            <div className="h-5 w-28 rounded bg-white/[0.08]" />
            <div className="h-3 w-full rounded bg-white/[0.04]" />
            <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Benchmark Suite Details Skeleton */}
      <div className="h-72 w-full rounded-2xl border border-white/[0.06] bg-[#0E1015]/60" />
    </div>
  );
}
