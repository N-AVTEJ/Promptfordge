export default function AcademyLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Academy Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-white/[0.06]" />
        <div className="h-8 w-72 rounded bg-white/[0.08]" />
        <div className="h-4 w-full max-w-xl rounded bg-white/[0.04]" />
      </div>

      {/* Modules Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 p-5 space-y-4"
          >
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-white/[0.06]" />
              <div className="h-4 w-12 rounded bg-white/[0.06]" />
            </div>
            <div className="h-6 w-3/4 rounded bg-white/[0.08]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-2/3 rounded bg-white/[0.04]" />
            <div className="pt-4 flex justify-between items-center border-t border-white/[0.04]">
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
              <div className="h-6 w-16 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
