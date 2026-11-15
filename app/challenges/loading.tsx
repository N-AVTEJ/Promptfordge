export default function ChallengesLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 w-full rounded-2xl border border-indigo-950/10 bg-white" />

        {/* Badges Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-indigo-950/10 bg-white flex flex-col items-center justify-center p-4"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-950/10" />
              <div className="mt-3 h-3 w-16 rounded bg-indigo-950/10" />
              <div className="mt-2 h-2.5 w-12 rounded bg-indigo-950/5" />
            </div>
          ))}
        </div>

        {/* Missions Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-indigo-950/10 bg-white p-8 space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-indigo-950/10" />
                <div className="h-4 w-12 rounded bg-indigo-950/10" />
              </div>
              <div className="h-5 w-48 rounded bg-indigo-950/10" />
              <div className="h-3.5 w-full rounded bg-indigo-950/5" />
              <div className="h-3.5 w-3/4 rounded bg-indigo-950/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
