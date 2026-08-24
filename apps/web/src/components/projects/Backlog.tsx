"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  Layers,
  FolderPlus,
  Zap,
  Calendar,
} from "lucide-react";
import { useCreateTask, useUpdateTask, useDeleteTask, useCreateSprint } from "@/hooks/useProjects";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
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
  DONE: { label: "Done", bg: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30", icon: CheckCircle2 },
  IN_PROGRESS: { label: "Working on it", bg: "bg-amber-500/10 text-amber-700 border border-amber-500/30", icon: Clock },
  IN_REVIEW: { label: "In Review", bg: "bg-purple-500/10 text-purple-700 border border-purple-500/30", icon: AlertCircle },
  TODO: { label: "Not Started", bg: "bg-slate-500/10 text-slate-700 border border-slate-500/30", icon: CircleDot },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string }
> = {
  HIGH: { label: "High", bg: "bg-rose-500/10 text-rose-700 border border-rose-500/30" },
  MEDIUM: { label: "Medium", bg: "bg-amber-500/10 text-amber-700 border border-amber-500/30" },
  LOW: { label: "Low", bg: "bg-slate-500/10 text-slate-700 border border-slate-500/30" },
};

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-purple-500",
];

const COLOR_OPTIONS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#a855f7",
  "#f43f5e",
  "#06b6d4",
];

function getAvatarBg(name?: string) {
  if (!name) return "bg-slate-400";
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function formatDateInput(d?: string | Date | null) {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function calculateDurationDays(start?: string | Date | null, due?: string | Date | null) {
  if (!start || !due) return null;
  try {
    const s = new Date(start).getTime();
    const e = new Date(due).getTime();
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return null;
  }
}

export function Backlog({ projectId, tasks = [], sprints = [], members = [] }: BacklogProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newTaskPriority, setNewTaskPriority] = useState<Record<string, string>>({});
  const [newTaskStatus, setNewTaskStatus] = useState<Record<string, string>>({});
  const [newTaskAssignee, setNewTaskAssignee] = useState<Record<string, string>>({});
  const [newTaskStartDate, setNewTaskStartDate] = useState<Record<string, string>>({});
  const [newTaskDueDate, setNewTaskDueDate] = useState<Record<string, string>>({});

  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupGoal, setNewGroupGoal] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#10b981");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const createSprintMutation = useCreateSprint(projectId);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  async function handleUpdateTask(taskId: string, payload: any) {
    setErrorMsg(null);
    try {
      await updateTaskMutation.mutateAsync({ taskId, payload });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update task";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    setErrorMsg(null);
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete task";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  async function handleCreateTask(groupSprintId?: string | null) {
    const key = groupSprintId || "backlog";
    const title = newTaskTitle[key]?.trim();
    if (!title) return;

    setErrorMsg(null);
    try {
      await createTaskMutation.mutateAsync({
        title,
        priority: newTaskPriority[key] || "MEDIUM",
        status: newTaskStatus[key] || "TODO",
        storyPoints: 3,
        sprintId: groupSprintId || undefined,
        assigneeId: newTaskAssignee[key] || undefined,
      });
      setNewTaskTitle((prev) => ({ ...prev, [key]: "" }));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create task";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
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
      setNewGroupName("");
      setNewGroupGoal("");
      setShowAddGroupForm(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create new group";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  const groups = [
    ...sprints.map((s) => ({
      id: s.id,
      title: s.name,
      status: s.status,
      color: s.color || (s.status === "ACTIVE" ? "#10b981" : s.status === "PLANNING" ? "#f59e0b" : "#64748b"),
      sprintId: s.id as string | null,
      tasks: tasks.filter((t) => t.sprintId === s.id),
    })),
    {
      id: "backlog",
      title: "Backlog (Unassigned)",
      status: "BACKLOG",
      color: "#3b82f6",
      sprintId: null as string | null,
      tasks: tasks.filter((t) => !t.sprintId),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header Summary Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <AnimatedIcon icon={Layers} animation="hover-bounce" size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Main Table & Backlog</h2>
            <p className="text-xs text-slate-500">
              {tasks.length} total tasks across {groups.length} groups · Assign start & due dates directly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mr-2 hidden md:flex">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-emerald-700 font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {tasks.filter((t) => t.status === "DONE").length} Done
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-700 font-bold border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {tasks.filter((t) => t.status === "IN_PROGRESS").length} Working
            </div>
            <div className="flex items-center gap-1.5 bg-slate-500/10 px-2.5 py-1 rounded-lg text-slate-700 font-bold border border-slate-500/20">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {tasks.filter((t) => t.status === "TODO").length} Not Started
            </div>
          </div>

          <button
            onClick={() => setShowAddGroupForm(!showAddGroupForm)}
            className="btn-primary text-xs font-bold"
          >
            <FolderPlus className="w-4 h-4" />
            New Group / Sprint
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
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
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Add New Sprint Group</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Group Name *</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
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
                onChange={(e) => setNewGroupGoal(e.target.value)}
                placeholder="What is the objective of this group?"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Group Color Theme</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewGroupColor(c)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all ${
                    newGroupColor === c ? "border-slate-900 scale-110" : "border-transparent hover:border-slate-300"
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
              {createSprintMutation.isPending ? "Creating Group..." : "Create Group"}
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

      {/* Backlog Groups */}
      {groups.map((group) => {
        const isCollapsed = collapsedGroups[group.id];
        const groupTasks = group.tasks;
        const totalPoints = groupTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
        const doneCount = groupTasks.filter((t) => t.status === "DONE").length;
        const inProgCount = groupTasks.filter((t) => t.status === "IN_PROGRESS").length;
        const totalCount = groupTasks.length;
        const key = group.id || "backlog";

        return (
          <div
            key={group.id}
            className="bg-white border border-slate-200/80 rounded-xl shadow-sm transition-all duration-200 overflow-hidden"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div
                  className="w-1.5 h-5 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h3
                  className="text-sm font-bold text-slate-900 cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.title}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  {groupTasks.length} tasks
                </span>
              </div>

              {/* Progress preview */}
              <div className="flex items-center gap-3">
                {totalCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="font-mono">{totalPoints} pts</span>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(doneCount / totalCount) * 100}%` }}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(inProgCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group Table with Start Date, Due Date, and Duration Columns */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-10 text-center">#</th>
                      <th className="py-2.5 px-4 min-w-[200px]">Task Name</th>
                      <th className="py-2.5 px-3 w-32 text-center">Status</th>
                      <th className="py-2.5 px-3 w-28 text-center">Priority</th>
                      <th className="py-2.5 px-3 w-20 text-center">Points</th>
                      <th className="py-2.5 px-3 w-36">Assignee</th>
                      <th className="py-2.5 px-3 w-32">Start Date</th>
                      <th className="py-2.5 px-3 w-32">Due Date</th>
                      <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                      <th className="py-2.5 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {groupTasks.map((task, idx) => {
                      const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                      const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                      const duration = calculateDurationDays(task.startDate, task.dueDate);

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/60 transition-colors group text-xs"
                        >
                          <td className="py-3 px-4 text-center font-semibold text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-900">
                            {task.title}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
                              className={`py-1 px-2 rounded-md font-bold text-xs cursor-pointer focus:outline-none transition-all ${statusCfg.bg}`}
                            >
                              <option value="TODO" className="bg-white text-slate-800">Not Started</option>
                              <option value="IN_PROGRESS" className="bg-white text-slate-800">Working on it</option>
                              <option value="IN_REVIEW" className="bg-white text-slate-800">In Review</option>
                              <option value="DONE" className="bg-white text-slate-800">Done</option>
                            </select>
                          </td>

                          <td className="py-3 px-2 text-center">
                            <select
                              value={task.priority}
                              onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value })}
                              className={`py-1 px-2 rounded-md font-bold text-xs cursor-pointer focus:outline-none transition-all ${priorityCfg.bg}`}
                            >
                              <option value="HIGH" className="bg-white text-slate-800">High</option>
                              <option value="MEDIUM" className="bg-white text-slate-800">Medium</option>
                              <option value="LOW" className="bg-white text-slate-800">Low</option>
                            </select>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                const ptsStr = prompt("Enter story points (0-100):", String(task.storyPoints || 0));
                                if (ptsStr !== null) {
                                  const pts = parseInt(ptsStr, 10);
                                  if (!isNaN(pts)) handleUpdateTask(task.id, { storyPoints: pts });
                                }
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs hover:bg-slate-200 transition-colors"
                            >
                              {task.storyPoints || 0}
                            </button>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              {task.assignee && (
                                <div className={`w-6 h-6 rounded-full ${getAvatarBg(task.assignee.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <select
                                value={task.assigneeId || task.assignee?.id || ""}
                                onChange={(e) => handleUpdateTask(task.id, { assigneeId: e.target.value || null })}
                                className="bg-white border border-slate-200 text-xs py-1 px-1.5 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[130px]"
                              >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                  <option key={m.userId} value={m.userId}>
                                    {m.user.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Start Date Column */}
                          <td className="py-3 px-3">
                            <input
                              type="date"
                              value={formatDateInput(task.startDate)}
                              onChange={(e) => handleUpdateTask(task.id, { startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                              className="bg-white border border-slate-200 text-[11px] py-1 px-2 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* Due Date Column */}
                          <td className="py-3 px-3">
                            <input
                              type="date"
                              value={formatDateInput(task.dueDate)}
                              onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                              className="bg-white border border-slate-200 text-[11px] py-1 px-2 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* Calculated Duration */}
                          <td className="py-3 px-3 text-center">
                            {duration ? (
                              <span className="bg-emerald-500/10 text-emerald-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
                                {duration} {duration === 1 ? "day" : "days"}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Set dates</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded hover:bg-slate-100"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Quick Add Row */}
                    <tr className="bg-slate-50/40 border-t border-slate-200/80">
                      <td className="py-3 px-4 text-center text-slate-400">
                        <Plus className="w-4 h-4 mx-auto" />
                      </td>
                      <td colSpan={9} className="py-2 px-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={newTaskTitle[key] || ""}
                            onChange={(e) =>
                              setNewTaskTitle((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateTask(group.sprintId);
                            }}
                            placeholder={`+ Add task to ${group.title}...`}
                            className="flex-1 min-w-[180px] bg-white text-xs py-1.5 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                          />

                          <select
                            value={newTaskPriority[key] || "MEDIUM"}
                            onChange={(e) => setNewTaskPriority((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="bg-white text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                          >
                            <option value="HIGH">High Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="LOW">Low Priority</option>
                          </select>

                          <select
                            value={newTaskStatus[key] || "TODO"}
                            onChange={(e) => setNewTaskStatus((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="bg-white text-xs py-1.5 px-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                          >
                            <option value="TODO">Not Started</option>
                            <option value="IN_PROGRESS">Working on it</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>

                          <button
                            onClick={() => handleCreateTask(group.sprintId)}
                            disabled={createTaskMutation.isPending}
                            className="btn-primary text-xs font-bold shrink-0 disabled:opacity-50"
                          >
                            {createTaskMutation.isPending ? "Adding..." : "Add Task"}
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
