'use client';

import { useState } from 'react';
import { GripVertical, User } from 'lucide-react';

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
  {
    status: 'TODO',
    label: 'To Do',
    accent: 'bg-stone-400',
    headerBg: 'bg-stone-50',
    dotColor: 'bg-stone-400',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    accent: 'bg-sky-500',
    headerBg: 'bg-sky-50',
    dotColor: 'bg-sky-500',
  },
  {
    status: 'IN_REVIEW',
    label: 'In Review',
    accent: 'bg-amber-500',
    headerBg: 'bg-amber-50',
    dotColor: 'bg-amber-500',
  },
  {
    status: 'DONE',
    label: 'Done',
    accent: 'bg-emerald-500',
    headerBg: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
];

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', className: 'badge-red' },
  MEDIUM: { label: 'Med', className: 'badge-amber' },
  LOW: { label: 'Low', className: 'badge-green' },
} as const;

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-stone-500',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function KanbanBoard({ projectId, tasks = [] }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

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
    <div className="grid grid-cols-4 gap-3 mt-2">
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus(col.status);
        const isOver = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={e => {
              e.preventDefault();
              setDragOverCol(col.status);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => {
              setDragOverCol(null);
              if (draggedTask && draggedTask.status !== col.status) {
                moveTask(draggedTask.id, col.status);
              }
            }}
            className={`flex flex-col rounded-xl border transition-colors duration-150 ${
              isOver
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-stone-200 bg-stone-50/60'
            }`}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b border-stone-200 ${col.headerBg}`}>
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span className="text-xs font-semibold text-stone-700 flex-1">{col.label}</span>
              <span className="text-xs text-stone-400 font-medium bg-white px-1.5 py-0.5 rounded-md border border-stone-200">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 min-h-[120px]">
              {colTasks.map(task => {
                const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task)}
                    onDragEnd={() => setDraggedTask(null)}
                    className="bg-white rounded-lg border border-stone-200 p-3 cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-sm transition-all duration-150 group"
                  >
                    {/* Drag handle row */}
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-stone-300 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm text-stone-800 font-medium leading-snug flex-1">
                        {task.title}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-2.5 gap-2">
                      <div className="flex items-center gap-1.5">
                        {priority && (
                          <span className={priority.className}>
                            {priority.label}
                          </span>
                        )}
                        {task.storyPoints > 0 && (
                          <span className="badge badge-stone">{task.storyPoints} pts</span>
                        )}
                      </div>

                      {task.assignee ? (
                        <div
                          className={`w-6 h-6 rounded-full ${avatarColor(task.assignee.name)} flex items-center justify-center text-white text-[10px] font-semibold shrink-0`}
                          title={task.assignee.name}
                        >
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-stone-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="flex items-center justify-center h-16 text-xs text-stone-400 border border-dashed border-stone-300 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
