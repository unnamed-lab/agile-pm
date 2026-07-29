'use client';

import { useState } from 'react';
import { Plus, Play, CheckCircle2, Calendar, ChevronRight, Zap, Target } from 'lucide-react';

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
  { label: string; bg: string; text: string; dot: string }
> = {
  PLANNING: {
    label: 'Planning',
    bg: 'bg-[#fdab3d]',
    text: 'text-white',
    dot: '#fdab3d',
  },
  ACTIVE: {
    label: 'Active Sprint',
    bg: 'bg-[#00c875]',
    text: 'text-white',
    dot: '#00c875',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[#94a3b8]',
    text: 'text-white',
    dot: '#94a3b8',
  },
};

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

export function SprintsList({ projectId, sprints, isLoading }: SprintsListProps) {
  const [showForm, setShowForm] = useState(false);

  async function updateSprint(sprintId: string, action: 'start' | 'complete') {
    const label = action === 'start' ? 'start' : 'mark as complete';
    if (!confirm(`Are you sure you want to ${label} this sprint?`)) return;
    await fetch(`/api/projects/${projectId}/sprints/${sprintId}/${action}`, {
      method: 'PATCH',
    });
    window.location.reload();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
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
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Sprint Management
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {sprints.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Manage sprint cycles, goals, and commitments</p>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {showForm && (
        <CreateSprintForm projectId={projectId} onClose={() => setShowForm(false)} />
      )}

      {/* Sprints Cards */}
      <div className="space-y-4">
        {sprints.length === 0 && !showForm && (
          <div className="card p-10 text-center text-slate-500 text-sm">
            <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No sprints created yet. Click <strong>New Sprint</strong> to plan your first iteration.
          </div>
        )}

        {sprints.map(sprint => {
          const cfg = STATUS_CONFIG[sprint.status] || STATUS_CONFIG.PLANNING;
          const taskList = sprint.tasks || [];
          const totalTasks = sprint._count?.tasks ?? taskList.length;
          const doneTasks = taskList.filter(t => t.status === 'DONE').length;
          const totalPoints = taskList.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
          const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          return (
            <div
              key={sprint.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative overflow-hidden"
            >
              {/* Left Accent Color Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: sprint.color || cfg.dot }}
              />

              <div className="flex flex-wrap items-start justify-between gap-4 pl-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: sprint.color || cfg.dot }}
                    />
                    <h3 className="text-base font-bold text-slate-800">{sprint.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${cfg.bg} ${cfg.text}`}
                    >
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
                        {new Date(sprint.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {' – '}
                        {new Date(sprint.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{totalTasks} tasks</span>
                    {totalPoints > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">{totalPoints} story points</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {sprint.status === 'PLANNING' && (
                    <button
                      onClick={() => updateSprint(sprint.id, 'start')}
                      className="bg-[#00c875] text-white hover:bg-emerald-600 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => updateSprint(sprint.id, 'complete')}
                      className="bg-slate-800 text-white hover:bg-slate-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete Sprint
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar line */}
              {totalTasks > 0 && (
                <div className="pl-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Sprint Completion Rate</span>
                    <span className="text-emerald-600 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#00c875] h-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
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
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#00c875');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, startDate, endDate, color }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-md space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-900">Create New Sprint Iteration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sprint Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
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
            onChange={e => setGoal(e.target.value)}
            placeholder="What primary goal should be achieved in this sprint?"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Accent Color</label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${
                  color === c ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:border-slate-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary font-bold text-xs">
          {loading ? 'Creating...' : 'Create Sprint'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}
