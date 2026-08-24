'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Layers,
  FolderPlus,
  Zap,
} from 'lucide-react';
import { useCreateTask, useUpdateTask, useDeleteTask, useCreateSprint } from '@/hooks/useProjects';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  sprintId?: string | null;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  color?: string;
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; avatarUrl?: string | null };
}

interface BacklogProps {
  projectId: string;
  tasks: Task[];
  sprints?: Sprint[];
  members?: Member[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; icon: any }
> = {
  DONE: { label: 'Done', bg: 'bg-[#00c875] text-white', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'Working on it', bg: 'bg-[#fdab3d] text-white', icon: Clock },
  IN_REVIEW: { label: 'In Review', bg: 'bg-[#a25ddc] text-white', icon: AlertCircle },
  TODO: { label: 'Not Started', bg: 'bg-[#94a3b8] text-white', icon: HelpCircle },
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

const COLOR_OPTIONS = [
  '#00c875',
  '#0073ea',
  '#fdab3d',
  '#a25ddc',
  '#e2445c',
  '#00d2d2',
  '#ff642f',
  '#579bfc',
];

function getAvatarBg(name?: string) {
  if (!name) return 'bg-slate-400';
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function Backlog({ projectId, tasks = [], sprints = [], members = [] }: BacklogProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newTaskPriority, setNewTaskPriority] = useState<Record<string, string>>({});
  const [newTaskStatus, setNewTaskStatus] = useState<Record<string, string>>({});
  const [newTaskAssignee, setNewTaskAssignee] = useState<Record<string, string>>({});

  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGoal, setNewGroupGoal] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#00c875');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const createSprintMutation = useCreateSprint(projectId);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  async function handleUpdateTask(taskId: string, payload: any) {
    setErrorMsg(null);
    try {
      await updateTaskMutation.mutateAsync({ taskId, payload });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update task';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    setErrorMsg(null);
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete task';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  }

  async function handleCreateTask(groupSprintId?: string | null) {
    const key = groupSprintId || 'backlog';
    const title = newTaskTitle[key]?.trim();
    if (!title) return;

    setErrorMsg(null);
    try {
      await createTaskMutation.mutateAsync({
        title,
        priority: newTaskPriority[key] || 'MEDIUM',
        status: newTaskStatus[key] || 'TODO',
        storyPoints: 3,
        sprintId: groupSprintId || undefined,
        assigneeId: newTaskAssignee[key] || undefined,
      });
      setNewTaskTitle(prev => ({ ...prev, [key]: '' }));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create task';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setErrorMsg(null);
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await createSprintMutation.mutateAsync({
        name: newGroupName.trim(),
        goal: newGroupGoal.trim() || undefined,
        startDate,
        endDate,
        color: newGroupColor,
      });
      setNewGroupName('');
      setNewGroupGoal('');
      setShowAddGroupForm(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create new group';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  }

  // Groups definition: Sprints + Unassigned Backlog
  const groups = [
    ...sprints.map(s => ({
      id: s.id,
      title: s.name,
      status: s.status,
      color: s.color || (s.status === 'ACTIVE' ? '#00c875' : s.status === 'PLANNING' ? '#fdab3d' : '#94a3b8'),
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 mr-2 hidden md:flex">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00c875]" />
              {tasks.filter(t => t.status === 'DONE').length} Done
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#fdab3d]" />
              {tasks.filter(t => t.status === 'IN_PROGRESS').length} Working
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#94a3b8]" />
              {tasks.filter(t => t.status === 'TODO').length} Not Started
            </div>
          </div>

          <button
            onClick={() => setShowAddGroupForm(!showAddGroupForm)}
            className="btn-primary flex items-center gap-1.5 text-xs font-bold"
          >
            <FolderPlus className="w-4 h-4" />
            New Group / Sprint
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add New Group Form */}
      {showAddGroupForm && (
        <form
          onSubmit={handleCreateGroup}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-md space-y-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Add New Sprint Group</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Group Name *</label>
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="e.g. Sprint 4 — Frontend Polish"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Goal (Optional)</label>
              <input
                type="text"
                value={newGroupGoal}
                onChange={e => setNewGroupGoal(e.target.value)}
                placeholder="What is the objective of this group?"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Group Color Theme</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewGroupColor(c)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all ${
                    newGroupColor === c ? 'border-slate-900 scale-110' : 'border-transparent hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={createSprintMutation.isPending}
              className="btn-primary text-xs font-bold disabled:opacity-50"
            >
              {createSprintMutation.isPending ? 'Creating Group...' : 'Create Group'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddGroupForm(false)}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Monday Style Groups */}
      {groups.map(group => {
        const isCollapsed = collapsedGroups[group.id];
        const groupTasks = group.tasks;
        const totalPoints = groupTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
        const doneCount = groupTasks.filter(t => t.status === 'DONE').length;
        const inProgCount = groupTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const totalCount = groupTasks.length;
        const key = group.id || 'backlog';

        return (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200 overflow-visible"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200 rounded-t-xl">
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
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-10 text-center">#</th>
                      <th className="py-2.5 px-4 min-w-[220px]">Task Name</th>
                      <th className="py-2.5 px-4 w-36 text-center">Status</th>
                      <th className="py-2.5 px-4 w-28 text-center">Priority</th>
                      <th className="py-2.5 px-4 w-24 text-center">Points</th>
                      <th className="py-2.5 px-4 w-44">Assignee</th>
                      <th className="py-2.5 px-4 w-12 text-center"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupTasks.map((task, idx) => {
                      const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                      const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

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

                          {/* Status Badge Select */}
                          <td className="py-3 px-2 text-center">
                            <select
                              value={task.status}
                              onChange={e => handleUpdateTask(task.id, { status: e.target.value })}
                              className={`py-1.5 px-3 rounded-lg font-bold text-xs cursor-pointer shadow-sm focus:outline-none transition-all ${statusCfg.bg}`}
                            >
                              <option value="TODO" className="bg-white text-slate-800 font-semibold">Not Started</option>
                              <option value="IN_PROGRESS" className="bg-white text-slate-800 font-semibold">Working on it</option>
                              <option value="IN_REVIEW" className="bg-white text-slate-800 font-semibold">In Review</option>
                              <option value="DONE" className="bg-white text-slate-800 font-semibold">Done</option>
                            </select>
                          </td>

                          {/* Priority Badge Select */}
                          <td className="py-3 px-2 text-center">
                            <select
                              value={task.priority}
                              onChange={e => handleUpdateTask(task.id, { priority: e.target.value })}
                              className={`py-1.5 px-2.5 rounded-lg font-bold text-xs cursor-pointer shadow-sm focus:outline-none transition-all ${priorityCfg.bg}`}
                            >
                              <option value="HIGH" className="bg-white text-slate-800 font-semibold">High</option>
                              <option value="MEDIUM" className="bg-white text-slate-800 font-semibold">Medium</option>
                              <option value="LOW" className="bg-white text-slate-800 font-semibold">Low</option>
                            </select>
                          </td>

                          {/* Story Points */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                const ptsStr = prompt('Enter story points (0-100):', String(task.storyPoints || 0));
                                if (ptsStr !== null) {
                                  const pts = parseInt(ptsStr, 10);
                                  if (!isNaN(pts)) handleUpdateTask(task.id, { storyPoints: pts });
                                }
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                              title="Click to edit story points"
                            >
                              {task.storyPoints || 0}
                            </button>
                          </td>

                          {/* Assignee Select */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <div className={`w-6 h-6 rounded-full ${getAvatarBg(task.assignee.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <select
                                value={task.assigneeId || task.assignee?.id || ''}
                                onChange={e => handleUpdateTask(task.id, { assigneeId: e.target.value || null })}
                                className="bg-white border border-slate-200 text-xs py-1 px-2 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[140px]"
                              >
                                <option value="">Unassigned</option>
                                {members.map(m => (
                                  <option key={m.userId} value={m.userId}>
                                    {m.user.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-slate-100"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Add Task Options Bar */}
                    <tr className="bg-slate-50/50 border-t border-slate-200">
                      <td className="py-3 px-4 text-center text-slate-400">
                        <Plus className="w-4 h-4 mx-auto" />
                      </td>
                      <td colSpan={6} className="py-2 px-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={newTaskTitle[key] || ''}
                            onChange={e =>
                              setNewTaskTitle(prev => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCreateTask(group.sprintId);
                            }}
                            placeholder={`+ Add task to ${group.title}...`}
                            className="flex-1 min-w-[180px] bg-white text-xs py-1.5 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                          />

                          <select
                            value={newTaskPriority[key] || 'MEDIUM'}
                            onChange={e => setNewTaskPriority(prev => ({ ...prev, [key]: e.target.value }))}
                            className="bg-white text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                          >
                            <option value="HIGH">High Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="LOW">Low Priority</option>
                          </select>

                          <select
                            value={newTaskStatus[key] || 'TODO'}
                            onChange={e => setNewTaskStatus(prev => ({ ...prev, [key]: e.target.value }))}
                            className="bg-white text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                          >
                            <option value="TODO">Not Started</option>
                            <option value="IN_PROGRESS">Working on it</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>

                          <select
                            value={newTaskAssignee[key] || ''}
                            onChange={e => setNewTaskAssignee(prev => ({ ...prev, [key]: e.target.value }))}
                            className="bg-white text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-slate-700 font-semibold max-w-[130px]"
                          >
                            <option value="">Unassigned</option>
                            {members.map(m => (
                              <option key={m.userId} value={m.userId}>
                                {m.user.name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleCreateTask(group.sprintId)}
                            disabled={createTaskMutation.isPending}
                            className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-all shrink-0 disabled:opacity-50 shadow-sm"
                          >
                            {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
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
