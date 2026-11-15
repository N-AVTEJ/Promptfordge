export default function ArenaLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-8 animate-pulse">
        <div className="h-40 w-full rounded-2xl border border-indigo-950/10 bg-white" />
        <div className="h-12 w-64 rounded-xl bg-indigo-950/10" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-96 rounded-2xl border border-indigo-950/10 bg-white lg:col-span-4" />
          <div className="h-96 rounded-2xl border border-indigo-950/10 bg-white lg:col-span-8" />
        </div>
      </div>
    </div>
  );
}
