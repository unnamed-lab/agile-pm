"use client";

import { useState } from "react";
import { Plus, Play, CheckCircle2, Calendar, Zap, Target, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateSprint, useUpdateSprint, useEditSprintDetails, useDeleteSprint } from "@/hooks/useProjects";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface Task {
  id: string;
  status: string;
  storyPoints?: number;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  goal?: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

interface SprintsListProps {
  projectId: string;
  sprints: Sprint[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; dot: string }
> = {
  PLANNING: {
    label: "Planning",
    bg: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    dot: "bg-amber-500",
  },
  ACTIVE: {
    label: "Active Sprint",
    bg: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    dot: "bg-emerald-500 animate-pulse",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
    dot: "bg-slate-400",
  },
};

const COLOR_OPTIONS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#a855f7",
  "#f43f5e",
  "#06b6d4",
];

export function SprintsList({ projectId, sprints = [], isLoading }: SprintsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateSprintMutation = useUpdateSprint(projectId);
  const deleteSprintMutation = useDeleteSprint(projectId);

  async function handleUpdateSprint(sprintId: string, action: "start" | "complete") {
    const label = action === "start" ? "start" : "mark as complete";
    if (!confirm(`Are you sure you want to ${label} this sprint?`)) return;

    setErrorMsg(null);
    try {
      await updateSprintMutation.mutateAsync({ sprintId, action });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || `Failed to ${label} sprint`;
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  async function handleDeleteSprint(sprintId: string, sprintName: string) {
    if (!confirm(`Are you sure you want to delete "${sprintName}"? Tasks will be unassigned to Backlog.`)) return;

    setErrorMsg(null);
    try {
      await deleteSprintMutation.mutateAsync(sprintId);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete sprint";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3 animate-pulse">
            <div className="h-5 skeleton w-1/3" />
            <div className="h-4 skeleton w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <AnimatedIcon icon={Zap} animation="hover-bounce" size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Sprint Management
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-mono">
                {sprints.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Manage sprint cycles, goals, and commitments</p>
          </div>
        </div>

        <button onClick={() => { setShowForm(!showForm); setEditingSprint(null); }} className="btn-primary text-xs font-bold">
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showForm && (
        <CreateSprintForm projectId={projectId} onClose={() => setShowForm(false)} />
      )}

      {editingSprint && (
        <EditSprintForm
          projectId={projectId}
          sprint={editingSprint}
          onClose={() => setEditingSprint(null)}
        />
      )}

      {/* Clean Sprints Cards */}
      <div className="space-y-4">
        {sprints.length === 0 && !showForm && !editingSprint && (
          <div className="card p-10 text-center text-slate-500 text-sm">
            <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No sprints created yet. Click <strong>New Sprint</strong> to plan your first iteration.
          </div>
        )}

        {sprints.map((sprint) => {
          const cfg = STATUS_CONFIG[sprint.status] || STATUS_CONFIG.PLANNING;
          const taskList = sprint.tasks || [];
          const totalTasks = sprint._count?.tasks ?? taskList.length;
          const doneTasks = taskList.filter((t) => t.status === "DONE").length;
          const totalPoints = taskList.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
          const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          return (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <h3 className="text-base font-bold text-slate-900">{sprint.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {sprint.goal && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{sprint.goal}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(sprint.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" – "}
                        {new Date(sprint.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{totalTasks} tasks</span>
                    {totalPoints > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700 font-mono">{totalPoints} story pts</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingSprint(sprint); setShowForm(false); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit sprint details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSprint(sprint.id, sprint.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete sprint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {sprint.status === "PLANNING" && (
                    <button
                      onClick={() => handleUpdateSprint(sprint.id, "start")}
                      disabled={updateSprintMutation.isPending}
                      className="btn-primary text-xs font-bold"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === "ACTIVE" && (
                    <button
                      onClick={() => handleUpdateSprint(sprint.id, "complete")}
                      disabled={updateSprintMutation.isPending}
                      className="btn-secondary text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Complete Sprint
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Progress bar line */}
              {totalTasks > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Sprint Completion Rate</span>
                    <span className="text-emerald-700 font-mono font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CreateSprintForm({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState("#10b981");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createSprintMutation = useCreateSprint(projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createSprintMutation.mutateAsync({
        name,
        goal: goal.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        color,
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create sprint";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-md space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-900">Create New Sprint Iteration</h3>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sprint Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 3 — Core Auth & Dashboard"
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sprint Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What primary goal should be achieved in this sprint?"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Accent Color</label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${
                  color === c ? "border-slate-900 scale-110 shadow-sm" : "border-transparent hover:border-slate-300"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={createSprintMutation.isPending}
          className="btn-primary font-bold text-xs disabled:opacity-50"
        >
          {createSprintMutation.isPending ? "Creating..." : "Create Sprint"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditSprintForm({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
}) {
  const formatDateForInput = (d: string | Date) => {
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [name, setName] = useState(sprint.name);
  const [goal, setGoal] = useState(sprint.goal || "");
  const [startDate, setStartDate] = useState(formatDateForInput(sprint.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(sprint.endDate));
  const [color, setColor] = useState(sprint.color || "#10b981");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const editSprintMutation = useEditSprintDetails(projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await editSprintMutation.mutateAsync({
        sprintId: sprint.id,
        data: {
          name,
          goal: goal.trim() || undefined,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          color,
        },
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update sprint";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-emerald-500/30 rounded-xl p-5 shadow-md space-y-4 ring-1 ring-emerald-500/20"
    >
      <div className="flex items-center gap-2">
        <Pencil className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-900">Edit Sprint Details — {sprint.name}</h3>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sprint Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sprint Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Primary sprint goal..."
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Accent Color</label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${
                  color === c ? "border-slate-900 scale-110 shadow-sm" : "border-transparent hover:border-slate-300"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={editSprintMutation.isPending}
          className="btn-primary font-bold text-xs disabled:opacity-50"
        >
          {editSprintMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}
