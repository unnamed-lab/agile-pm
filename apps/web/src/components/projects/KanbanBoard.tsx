'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

const COLUMNS = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'In Review' },
  { status: 'DONE', label: 'Done' },
];

export function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  async function moveTask(taskId: string, newStatus: string) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    window.location.reload();
  }

  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {COLUMNS.map(col => (
        <div key={col.status} className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-3">
            {col.label} <span className="text-gray-500 text-sm">{tasksByStatus(col.status).length}</span>
          </h3>
          <div className="space-y-2">
            {tasksByStatus(col.status).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDraggedTask(task)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedTask && draggedTask.status !== col.status) {
                    moveTask(draggedTask.id, col.status);
                  }
                }}
                className="bg-white p-3 rounded shadow-sm cursor-move hover:shadow-md transition"
              >
                <p className="font-medium text-sm">{task.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                  {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {task.assignee.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
