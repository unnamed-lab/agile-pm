import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <>
      <header className="page-header">
        <div className="space-y-1">
          <div className="h-4 skeleton w-24" />
          <div className="h-3 skeleton w-32" />
        </div>
        <div className="h-9 skeleton w-32 rounded-lg" />
      </header>
      <main className="page-content">
        <div className="space-y-2 mb-6">
          <div className="h-6 skeleton w-48" />
          <div className="h-4 skeleton w-56" />
        </div>
        <LoadingSkeleton />
      </main>
    </>
  );
}
