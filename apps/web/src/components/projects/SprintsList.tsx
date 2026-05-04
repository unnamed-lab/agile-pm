'use client';

import { useState } from 'react';
import { Plus, Play, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  _count?: { tasks: number };
}

interface SprintsListProps {
  projectId: string;
  sprints: Sprint[];
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  PLANNING: {
    label: 'Planning',
    className: 'badge-stone',
    dot: 'bg-stone-400',
  },
  ACTIVE: {
    label: 'Active',
    className: 'badge-green',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'badge-sky',
    dot: 'bg-sky-500',
  },
} as const;

const COLOR_OPTIONS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
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
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-4 space-y-2 animate-pulse">
            <div className="h-5 skeleton w-1/3" />
            <div className="h-4 skeleton w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-700">
          Sprints
          <span className="ml-1.5 text-xs font-normal text-stone-400">
            ({sprints.length})
          </span>
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {showForm && (
        <CreateSprintForm projectId={projectId} onClose={() => setShowForm(false)} />
      )}

      <div className="space-y-3">
        {sprints.length === 0 && !showForm && (
          <div className="card p-8 text-center text-stone-500 text-sm">
            No sprints yet. Create one to get started.
          </div>
        )}
        {sprints.map(sprint => {
          const cfg = STATUS_CONFIG[sprint.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PLANNING;
          return (
            <div
              key={sprint.id}
              className="card p-4 flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: sprint.color || cfg.dot }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-stone-900 truncate">
                    {sprint.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-stone-500">
                    <Calendar className="w-3 h-3" />
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
                    {sprint._count?.tasks !== undefined && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span>{sprint._count.tasks} tasks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sprint.status === 'PLANNING' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'start')}
                    className="btn-primary py-1.5 px-3"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start
                  </button>
                )}
                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'complete')}
                    className="btn-secondary py-1.5 px-3"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                )}
                <span className={cfg.className}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
                      {' – '}
                      {new Date(sprint.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {sprint._count?.tasks !== undefined && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span>{sprint._count.tasks} tasks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sprint.status === 'PLANNING' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'start')}
                    className="btn-primary py-1.5 px-3"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start
                  </button>
                )}
                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'complete')}
                    className="btn-secondary py-1.5 px-3"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                )}
                <span className={cfg.className}>{cfg.label}</span>
              </div>
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
  const [color, setColor] = useState('#10B981');
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
      className="card p-5 mb-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-stone-900">New Sprint</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Sprint name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Sprint 1"
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Goal</label>
          <input
            type="text"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="What do you aim to achieve?"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Start date *</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">End date *</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Sprint color</label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  color === c ? 'border-stone-900 scale-110' : 'border-transparent hover:border-stone-300'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating…' : 'Create Sprint'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
