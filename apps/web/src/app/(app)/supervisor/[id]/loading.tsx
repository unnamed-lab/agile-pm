export default function SupervisorLoading() {
  return (
    <>
      <header className="page-header">
        <div className="flex items-center gap-2">
          <div className="h-4 skeleton w-20" />
          <div className="h-4 skeleton w-2" />
          <div className="h-4 skeleton w-32" />
          <div className="h-4 skeleton w-2" />
          <div className="h-4 skeleton w-20" />
        </div>
      </header>
      <main className="page-content space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 skeleton rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 skeleton w-10" />
                <div className="h-3 skeleton w-24" />
              </div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="card p-5 space-y-3">
          <div className="h-4 skeleton w-40" />
          <div className="h-2.5 skeleton w-full rounded-full" />
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 space-y-4">
              <div className="h-4 skeleton w-48" />
              <div className="h-40 skeleton rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
