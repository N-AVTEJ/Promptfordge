export default function LabsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 rounded bg-white/[0.06]" />
        <div className="h-8 w-64 rounded bg-white/[0.08]" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.04]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 p-3" />
        ))}
      </div>

      {/* Main Lab Viewport Skeleton */}
      <div className="h-96 w-full rounded-2xl border border-white/[0.06] bg-[#0E1015]/60" />
    </div>
  );
}
