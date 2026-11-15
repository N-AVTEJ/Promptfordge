export default function ChallengesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />

      {/* Badges Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 flex flex-col items-center justify-center p-3"
          >
            <div className="h-12 w-12 rounded-xl bg-white/[0.05]" />
            <div className="mt-3 h-3 w-16 rounded bg-white/[0.06]" />
            <div className="mt-2 h-2.5 w-12 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Missions Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-52 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-white/[0.06]" />
              <div className="h-4 w-12 rounded bg-white/[0.06]" />
            </div>
            <div className="h-5 w-48 rounded bg-white/[0.08]" />
            <div className="h-3.5 w-full rounded bg-white/[0.04]" />
            <div className="h-3.5 w-3/4 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
