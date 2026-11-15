export default function ArenaLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      <div className="h-36 w-full rounded-xl border border-white/[0.06] bg-[#0E1015]/60" />
      <div className="h-12 w-64 rounded-lg bg-white/[0.05]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-96 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 lg:col-span-4" />
        <div className="h-96 rounded-xl border border-white/[0.06] bg-[#0E1015]/60 lg:col-span-8" />
      </div>
    </div>
  );
}
