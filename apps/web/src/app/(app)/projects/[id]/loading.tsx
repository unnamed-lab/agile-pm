import { KanbanSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ProjectLoading() {
  return (
    <>
      <header className="page-header">
        <div className="flex items-center gap-2">
          <div className="h-4 skeleton w-20" />
          <div className="h-4 skeleton w-2" />
          <div className="h-4 skeleton w-36" />
        </div>
        <div className="h-9 skeleton w-28 rounded-lg" />
      </header>
      <main className="page-content">
        {/* Tab bar skeleton */}
        <div className="bg-white border border-stone-200 rounded-xl mb-4 overflow-hidden">
          <div className="flex gap-0">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-11 skeleton w-24 m-1.5 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
        <KanbanSkeleton />
      </main>
    </>
  );
}
