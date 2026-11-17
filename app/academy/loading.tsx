export default function AcademyLoading() {
  return (
    <div className="min-h-screen bg-daylight">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        {/* Academy Header Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-36 rounded-full bg-navy/5" />
          <div className="h-10 w-80 rounded-xl bg-navy/5" />
          <div className="h-4 w-full max-w-xl rounded bg-navy/5" />
        </div>

        {/* Modules Grid Skeleton (max 3 cards per row: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl border border-navy/10 bg-white p-8 space-y-4 shadow-sm"
            >
              <div className="flex justify-between">
                <div className="h-5 w-24 rounded-full bg-daylight" />
                <div className="h-8 w-8 rounded-full bg-navy/5" />
              </div>
              <div className="h-7 w-3/4 rounded bg-navy/5" />
              <div className="h-4 w-full rounded bg-navy/5" />
              <div className="h-4 w-2/3 rounded bg-navy/5" />
              <div className="pt-6 flex justify-between items-center border-t border-navy/10">
                <div className="h-4 w-20 rounded bg-navy/5" />
                <div className="h-8 w-24 rounded-xl bg-ultramarine/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
