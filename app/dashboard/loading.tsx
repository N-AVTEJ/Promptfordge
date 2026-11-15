export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-40 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />

      {/* Progress Rings Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 flex flex-col items-center justify-center p-4"
          >
            <div className="h-24 w-24 rounded-full border-4 border-white/[0.05] bg-white/[0.02]" />
            <div className="mt-4 h-3 w-20 rounded bg-white/[0.06]" />
            <div className="mt-2 h-2.5 w-14 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Recommended Lesson Skeleton */}
      <div className="h-32 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />
        <div className="h-64 rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />
      </div>
    </div>
  );
}
