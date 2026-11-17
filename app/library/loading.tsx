export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-daylight">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        {/* Library Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-navy/5" />
            <div className="h-8 w-60 rounded-xl bg-navy/5" />
            <div className="h-4 w-80 rounded bg-navy/5" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-ultramarine/10" />
        </div>

        {/* Filter and Search Bar Skeleton */}
        <div className="h-12 w-full rounded-2xl border border-navy/10 bg-white" />

        {/* Prompts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-navy/10 bg-white p-8 space-y-3 shadow-sm"
            >
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded bg-navy/5" />
                <div className="h-4 w-10 rounded bg-navy/5" />
              </div>
              <div className="h-3 w-full rounded bg-navy/5" />
              <div className="h-3 w-4/5 rounded bg-navy/5" />
              <div className="pt-6 flex justify-between items-center border-t border-navy/10">
                <div className="h-4 w-20 rounded bg-navy/5" />
                <div className="h-4 w-16 rounded bg-navy/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
