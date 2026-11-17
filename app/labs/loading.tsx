export default function LabsLoading() {
  return (
    <div className="min-h-screen bg-daylight">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-36 rounded-full bg-navy/5" />
          <div className="h-8 w-64 rounded-xl bg-navy/5" />
          <div className="h-4 w-full max-w-2xl rounded bg-navy/5" />
        </div>

        {/* Labs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-navy/10 bg-white p-8 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
