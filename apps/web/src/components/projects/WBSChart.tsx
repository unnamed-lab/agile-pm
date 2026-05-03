'use client';

interface Task {
  id: string;
  title: string;
  status: string;
  storyPoints: number;
  priority: string;
  assignee?: { name: string } | null;
}

interface WBSChartProps {
  tasks: Task[];
  groupBy?: 'status' | 'priority' | 'assignee';
}

export function WBSChart({ tasks, groupBy = 'status' }: WBSChartProps) {
  const groups: Record<string, typeof tasks> = {};

  tasks.forEach(task => {
    let key: string;
    switch (groupBy) {
      case 'status':
        key = task.status || 'TODO';
        break;
      case 'priority':
        key = task.priority;
        break;
      case 'assignee':
        key = task.assignee?.name || 'Unassigned';
        break;
      default:
        key = 'Other';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  });

  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 border-gray-300',
    IN_PROGRESS: 'bg-blue-50 border-blue-300',
    IN_REVIEW: 'bg-yellow-50 border-yellow-300',
    DONE: 'bg-green-50 border-green-300',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-green-50 border-green-300',
    MEDIUM: 'bg-yellow-50 border-yellow-300',
    HIGH: 'bg-red-50 border-red-300',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {(['status', 'priority', 'assignee'] as const).map(opt => (
          <button
            key={opt}
            className={`px-3 py-1 text-sm rounded ${groupBy === opt ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Group by {opt}
          </button>
        ))}
      </div>

      {Object.entries(groups).map(([group, groupTasks]) => (
        <div key={group} className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center justify-between">
            {group}
            <span className="text-sm text-gray-500">{groupTasks.length} tasks · {groupTasks.reduce((sum, t) => sum + t.storyPoints, 0)} pts</span>
          </h4>
          <div className="space-y-2">
            {groupTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded border ${groupBy === 'status' ? statusColors[task.status] || 'bg-gray-50' : groupBy === 'priority' ? priorityColors[task.priority] || 'bg-gray-50' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{task.title}</p>
                  <span className="text-xs text-gray-500">{task.storyPoints} pts</span>
                </div>
                {task.assignee && (
                  <p className="text-xs text-gray-600 mt-1">Assigned to: {task.assignee.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
