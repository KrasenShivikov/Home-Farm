function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200/80 ${className}`} />;
}

function SkeletonCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-emerald-50/50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>
          <SkeletonBlock className="h-8 w-24" />
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
        <SkeletonBlock className="h-11 w-full" />
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <main className="container py-10">
      <div className="mb-8 space-y-4">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-9 w-72 max-w-full" />
        <SkeletonBlock className="h-5 w-[32rem] max-w-full" />
      </div>

      <div className="mb-8 flex w-full max-w-3xl gap-3 rounded-full border border-emerald-900/10 bg-white/80 p-2 shadow-sm">
        <SkeletonBlock className="h-10 w-32" />
        <SkeletonBlock className="h-10 w-32" />
        <SkeletonBlock className="h-10 w-32" />
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  );
}
