'use client';

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  tasks?: Array<{ id: string; title: string; status: string; storyPoints: number }>;
}

interface GanttChartProps {
  sprints: Sprint[];
  projectStartDate?: string | Date;
  projectEndDate?: string | Date;
}

export function GanttChart({ sprints, projectStartDate, projectEndDate }: GanttChartProps) {
  if (sprints.length === 0) return <p className="text-stone-500">No sprints to display</p>;

  const start = projectStartDate
    ? new Date(projectStartDate)
    : new Date(Math.min(...sprints.map(s => new Date(s.startDate).getTime())));
  const end = projectEndDate
    ? new Date(projectEndDate)
    : new Date(Math.max(...sprints.map(s => new Date(s.endDate).getTime())));
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const statusColors: Record<string, string> = {
    TODO: '#9CA3AF',
    IN_PROGRESS: '#3B82F6',
    IN_REVIEW: '#F59E0B',
    DONE: '#10B981',
  };

  const sprintStatusColors: Record<string, string> = {
    PLANNING: '#F59E0B',
    ACTIVE: '#10B981',
    COMPLETED: '#6B7280',
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Timeline header */}
        <div className="flex border-b pb-2 mb-4">
          <div className="w-48 font-semibold">Sprint</div>
          <div className="flex-1 relative h-8">
            {Array.from({ length: Math.min(totalDays, 30) }, (_, i) => {
              const date = new Date(start);
              date.setDate(date.getDate() + i);
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={i}
                  className={`absolute text-xs ${isToday ? 'text-emerald-600 font-bold' : 'text-stone-500'}`}
                  style={{ left: `${(i / totalDays) * 100}%` }}
                >
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sprints */}
        {sprints.map(sprint => {
          const sprintStart = new Date(sprint.startDate);
          const sprintEnd = new Date(sprint.endDate);
          const left = Math.max(0, ((sprintStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100);
          const width = Math.max(2, ((sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100);

          return (
            <div key={sprint.id} className="flex items-center mb-4 group">
              <div className="w-48 pr-4">
                <p className="font-medium text-sm text-stone-800">{sprint.name}</p>
                <p className="text-xs text-stone-500">
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex-1 relative h-12 bg-stone-100 rounded-lg overflow-visible">
                <div
                  className="absolute h-full rounded-lg flex items-center px-3 text-xs text-white font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: sprintStatusColors[sprint.status],
                  }}
                  title={`${sprint.name} (${sprint.status})`}
                >
                  {sprint.status}
                </div>
                {/* Task bars inside sprint */}
                {sprint.tasks?.map((task, idx) => (
                  <div
                    key={task.id}
                    className="absolute h-4 rounded opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    style={{
                      left: `${left + 1}%`,
                      top: `${idx * 5 + 14}px`,
                      width: `${width * 0.95}%`,
                      backgroundColor: statusColors[task.status] || '#9CA3AF',
                    }}
                    title={`${task.title} (${task.status})`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
