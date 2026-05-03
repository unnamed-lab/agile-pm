import { KanbanSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b bg-white px-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <KanbanSkeleton />
        </div>
      </main>
    </div>
  );
}
