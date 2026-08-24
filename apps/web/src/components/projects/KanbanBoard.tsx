'use client';

import { useState } from 'react';
import { GripVertical, User, CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { useMoveTask } from '@/hooks/useProjects';

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
    label: 'Not Started',
    headerBg: 'bg-[#94a3b8]',
    badgeBg: 'bg-[#94a3b8]',
    icon: HelpCircle,
  },
  {
    status: 'IN_PROGRESS',
    label: 'Working on it',
    headerBg: 'bg-[#fdab3d]',
    badgeBg: 'bg-[#fdab3d]',
    icon: Clock,
  },
  {
    status: 'IN_REVIEW',
    label: 'In Review',
    headerBg: 'bg-[#a25ddc]',
    badgeBg: 'bg-[#a25ddc]',
    icon: AlertCircle,
  },
  {
    status: 'DONE',
    label: 'Done',
    headerBg: 'bg-[#00c875]',
    badgeBg: 'bg-[#00c875]',
    icon: CheckCircle2,
  },
];

const PRIORITY_CONFIG: Record<string, { label: string; bg: string }> = {
  HIGH: { label: 'High', bg: 'bg-rose-500 text-white' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500 text-white' },
  LOW: { label: 'Low', bg: 'bg-blue-400 text-white' },
};

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-amber-500',
];

function getAvatarBg(name?: string) {
  if (!name) return 'bg-slate-400';
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function KanbanBoard({ projectId, tasks = [] }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const moveTaskMutation = useMoveTask(projectId);

  const tasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  async function handleMoveTask(taskId: string, newStatus: string) {
    try {
      await moveTaskMutation.mutateAsync({ taskId, status: newStatus });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus(col.status);
        const isOver = dragOverCol === col.status;
        const Icon = col.icon;

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
                handleMoveTask(draggedTask.id, col.status);
              }
            }}
            className={`flex flex-col rounded-xl border transition-all duration-200 shadow-sm ${
              isOver
                ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-300'
                : 'border-slate-200 bg-slate-50/60'
            }`}
          >
            {/* Column Header Banner */}
            <div className={`${col.headerBg} text-white px-4 py-3 rounded-t-xl flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-bold text-sm tracking-wide">{col.label}</span>
              </div>
              <span className="bg-white/30 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-inner">
                {colTasks.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 p-3 space-y-3 min-h-[300px]">
              {colTasks.map(task => {
                const priority = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task)}
                    onDragEnd={() => setDraggedTask(null)}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 cursor-grab active:cursor-grabbing hover:border-emerald-400 hover:shadow-md transition-all duration-200 group relative"
                  >
                    {/* Drag Handle & Title */}
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">
                        {task.title}
                      </p>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        {priority && (
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-sm ${priority.bg}`}>
                            {priority.label}
                          </span>
                        )}
                        {task.storyPoints > 0 && (
                          <span className="bg-slate-100 text-slate-700 font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                            {task.storyPoints} pts
                          </span>
                        )}
                      </div>

                      {/* Assignee Avatar */}
                      {task.assignee ? (
                        <div
                          className={`w-7 h-7 rounded-full ${getAvatarBg(task.assignee.name)} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm`}
                          title={task.assignee.name}
                        >
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-28 text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
                  <span>Drop tasks here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
