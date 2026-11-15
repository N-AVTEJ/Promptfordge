export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse bg-cream">
      {/* Banner Skeleton */}
      <div className="h-40 w-full rounded-2xl border border-indigo-950/10 bg-white" />

      {/* Progress Rings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 rounded-2xl border border-indigo-950/10 bg-white flex flex-col items-center justify-center p-8"
          >
            <div className="h-28 w-28 rounded-full border-4 border-indigo-950/10 bg-cream" />
            <div className="mt-4 h-3 w-24 rounded bg-indigo-950/10" />
            <div className="mt-2 h-2.5 w-16 rounded bg-indigo-950/5" />
          </div>
        ))}
      </div>

      {/* Continue Learning Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl border border-indigo-950/10 bg-white p-8" />
        ))}
      </div>
    </div>
  );
}
