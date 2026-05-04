export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 skeleton rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 skeleton w-12" />
              <div className="h-3 skeleton w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card p-5 space-y-4">
            <div className="space-y-2">
              <div className="h-5 skeleton w-3/4" />
              <div className="h-3.5 skeleton w-full" />
              <div className="h-3.5 skeleton w-2/3" />
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center gap-4">
              <div className="h-3.5 skeleton w-16" />
              <div className="h-3.5 skeleton w-14" />
              <div className="flex -space-x-1.5 ml-auto">
                {[1, 2, 3].map(j => (
                  <div key={j} className="w-6 h-6 rounded-full skeleton border-2 border-white" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(col => (
        <div key={col} className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-200 bg-stone-100">
            <div className="w-2 h-2 rounded-full skeleton" />
            <div className="h-3.5 skeleton flex-1" />
            <div className="h-5 w-6 skeleton rounded-md" />
          </div>
          <div className="p-2 space-y-2">
            {[1, 2, 3].map(card => (
              <div key={card} className="bg-white rounded-lg border border-stone-200 p-3 space-y-2">
                <div className="h-4 skeleton w-full" />
                <div className="h-4 skeleton w-2/3" />
                <div className="flex justify-between items-center pt-1">
                  <div className="h-4 skeleton w-12 rounded-md" />
                  <div className="w-6 h-6 rounded-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SprintSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="card px-4 py-3 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 skeleton w-40" />
            <div className="h-3 skeleton w-56" />
          </div>
          <div className="h-6 skeleton w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
