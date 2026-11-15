export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Library Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-white/[0.06]" />
          <div className="h-8 w-60 rounded bg-white/[0.08]" />
          <div className="h-4 w-80 rounded bg-white/[0.04]" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-white/[0.06]" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />

      {/* Prompts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-32 rounded bg-white/[0.08]" />
              <div className="h-4 w-10 rounded bg-white/[0.06]" />
            </div>
            <div className="h-3 w-full rounded bg-white/[0.04]" />
            <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
            <div className="pt-4 flex justify-between items-center border-t border-white/[0.04]">
              <div className="h-4 w-20 rounded bg-white/[0.04]" />
              <div className="h-4 w-16 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
