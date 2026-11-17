export default function EvaluateLoading() {
  return (
    <div className="min-h-screen bg-daylight">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        {/* Evaluate Header Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-36 rounded-full bg-navy/5" />
          <div className="h-8 w-72 rounded-xl bg-navy/5" />
          <div className="h-4 w-full max-w-2xl rounded bg-navy/5" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-navy/10 bg-white p-8 space-y-3"
            >
              <div className="h-5 w-28 rounded bg-navy/5" />
              <div className="h-3 w-full rounded bg-navy/5" />
              <div className="h-3 w-3/4 rounded bg-navy/5" />
            </div>
          ))}
        </div>

        {/* Benchmark Suite Details Skeleton */}
        <div className="h-72 w-full rounded-2xl border border-navy/10 bg-white" />
      </div>
    </div>
  );
}
