'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  User,
  Zap,
  MoreHorizontal,
  Layers,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  sprintId?: string | null;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
}

interface BacklogProps {
  projectId: string;
  tasks: Task[];
  sprints?: Sprint[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; icon: any }
> = {
  DONE: { label: 'Done', bg: 'bg-[#00c875] text-white', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'Working on it', bg: 'bg-[#fdab3d] text-white', icon: Clock },
  IN_REVIEW: { label: 'In Review', bg: 'bg-[#a25ddc] text-white', icon: AlertCircle },
  TODO: { label: 'Not Started', bg: 'bg-[#c4c4c4] text-white', icon: HelpCircle },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string }
> = {
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

export function Backlog({ projectId, tasks = [], sprints = [] }: BacklogProps) {
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [activeDropdown, setActiveDropdown] = useState<{
    type: 'status' | 'priority' | 'sprint';
    taskId: string;
  } | null>(null);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  async function updateTask(taskId: string, payload: Partial<Task>) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setActiveDropdown(null);
    router.refresh();
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
    router.refresh();
  }

  async function handleCreateTask(groupSprintId?: string | null) {
    const key = groupSprintId || 'backlog';
    const title = newTaskTitle[key]?.trim();
    if (!title) return;

    await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        priority: 'MEDIUM',
        status: 'TODO',
        storyPoints: 3,
        sprintId: groupSprintId || null,
      }),
    });

    setNewTaskTitle(prev => ({ ...prev, [key]: '' }));
    router.refresh();
  }

  // Groups definition: Sprints + Unassigned Backlog
  const groups = [
    ...sprints.map(s => ({
      id: s.id,
      title: s.name,
      status: s.status,
      color: s.status === 'ACTIVE' ? '#00c875' : s.status === 'PLANNING' ? '#fdab3d' : '#94a3b8',
      sprintId: s.id as string | null,
      tasks: tasks.filter(t => t.sprintId === s.id),
    })),
    {
      id: 'backlog',
      title: 'Backlog (Unassigned)',
      status: 'BACKLOG',
      color: '#0073ea',
      sprintId: null as string | null,
      tasks: tasks.filter(t => !t.sprintId),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Main Table & Backlog</h2>
            <p className="text-xs text-slate-500">
              {tasks.length} total tasks across {groups.length} groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-[#00c875]" />
            {tasks.filter(t => t.status === 'DONE').length} Done
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700">
            <span className="w-2 h-2 rounded-full bg-[#fdab3d]" />
            {tasks.filter(t => t.status === 'IN_PROGRESS').length} Working
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#c4c4c4]" />
            {tasks.filter(t => t.status === 'TODO').length} Not Started
          </div>
        </div>
      </div>

      {/* Monday Style Groups */}
      {groups.map(group => {
        const isCollapsed = collapsedGroups[group.id];
        const groupTasks = group.tasks;
        const totalPoints = groupTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
        const doneCount = groupTasks.filter(t => t.status === 'DONE').length;
        const inProgCount = groupTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const totalCount = groupTasks.length;

        return (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h3
                  className="text-base font-bold text-slate-800 cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.title}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  {groupTasks.length} tasks
                </span>
              </div>

              {/* Progress Pills preview */}
              <div className="flex items-center gap-3">
                {totalCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span>{totalPoints} pts</span>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#00c875] h-full"
                        style={{ width: `${(doneCount / totalCount) * 100}%` }}
                        title={`${doneCount} Done`}
                      />
                      <div
                        className="bg-[#fdab3d] h-full"
                        style={{ width: `${(inProgCount / totalCount) * 100}%` }}
                        title={`${inProgCount} Working`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group Content (Table) */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-10 text-center">#</th>
                      <th className="py-2.5 px-4 min-w-[240px]">Task Name</th>
                      <th className="py-2.5 px-4 w-36 text-center">Status</th>
                      <th className="py-2.5 px-4 w-28 text-center">Priority</th>
                      <th className="py-2.5 px-4 w-24 text-center">Points</th>
                      <th className="py-2.5 px-4 w-36">Assignee</th>
                      <th className="py-2.5 px-4 w-12 text-center"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupTasks.map((task, idx) => {
                      const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                      const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                      const StatusIcon = statusCfg.icon;

                      return (
                        <tr
                          key={task.id}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group text-xs"
                        >
                          {/* Row Index */}
                          <td className="py-3 px-4 text-center font-semibold text-slate-400">
                            {idx + 1}
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4 font-medium text-slate-800">
                            <span>{task.title}</span>
                          </td>

                          {/* Status Badge (Monday Popover) */}
                          <td className="py-3 px-3 text-center relative">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown?.taskId === task.id &&
                                    activeDropdown.type === 'status'
                                    ? null
                                    : { type: 'status', taskId: task.id }
                                )
                              }
                              className={`w-full py-1.5 px-3 rounded-md font-semibold text-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${statusCfg.bg}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{statusCfg.label}</span>
                            </button>

                            {/* Status Selector Dropdown */}
                            {activeDropdown?.taskId === task.id &&
                              activeDropdown.type === 'status' && (
                                <div className="absolute z-20 top-12 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 w-44 space-y-1">
                                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                    <button
                                      key={key}
                                      onClick={() => updateTask(task.id, { status: key })}
                                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${cfg.bg}`}
                                    >
                                      <cfg.icon className="w-3.5 h-3.5" />
                                      {cfg.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </td>

                          {/* Priority Badge */}
                          <td className="py-3 px-3 text-center relative">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown?.taskId === task.id &&
                                    activeDropdown.type === 'priority'
                                    ? null
                                    : { type: 'priority', taskId: task.id }
                                )
                              }
                              className={`w-full py-1.5 px-2.5 rounded-md font-semibold text-xs transition-transform active:scale-95 flex items-center justify-center gap-1 shadow-sm ${priorityCfg.bg}`}
                            >
                              {priorityCfg.label}
                            </button>

                            {/* Priority Dropdown */}
                            {activeDropdown?.taskId === task.id &&
                              activeDropdown.type === 'priority' && (
                                <div className="absolute z-20 top-12 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 w-32 space-y-1">
                                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                    <button
                                      key={key}
                                      onClick={() => updateTask(task.id, { priority: key })}
                                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold text-center transition-all ${cfg.bg}`}
                                    >
                                      {cfg.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </td>

                          {/* Story Points */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                              {task.storyPoints || 0}
                            </span>
                          </td>

                          {/* Assignee */}
                          <td className="py-3 px-4">
                            {task.assignee ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-full ${getAvatarBg(
                                    task.assignee.name
                                  )} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm`}
                                >
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-slate-700 font-medium truncate max-w-[100px]">
                                  {task.assignee.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-slate-100"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Add Task Input Row */}
                    <tr className="bg-slate-50/40 border-t border-slate-200">
                      <td className="py-2.5 px-4 text-center text-slate-400">
                        <Plus className="w-4 h-4 mx-auto" />
                      </td>
                      <td colSpan={6} className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTaskTitle[group.id || 'backlog'] || ''}
                            onChange={e =>
                              setNewTaskTitle(prev => ({
                                ...prev,
                                [group.id || 'backlog']: e.target.value,
                              }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCreateTask(group.sprintId);
                            }}
                            placeholder="+ Add task to this group..."
                            className="flex-1 bg-transparent text-xs py-1.5 px-2 border-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
                          />
                          <button
                            onClick={() => handleCreateTask(group.sprintId)}
                            className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-emerald-700 transition-all shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
