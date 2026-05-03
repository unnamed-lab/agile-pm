'use client';

import { useState } from 'react';

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  _count?: { tasks: number };
}

interface SprintsListProps {
  projectId: string;
  sprints: Sprint[];
  isLoading?: boolean;
}

interface SprintsListProps {
  projectId: string;
  sprints: Sprint[];
  isLoading?: boolean;
}

export function SprintsList({ projectId, sprints, isLoading }: SprintsListProps) {
  const [showForm, setShowForm] = useState(false);

  async function updateSprint(sprintId: string, action: 'start' | 'complete') {
    if (!confirm(`Are you sure you want to ${action} this sprint?`)) return;
    await fetch(`/api/projects/${projectId}/sprints/${sprintId}/${action}`, { method: 'PATCH' });
    window.location.reload();
  }

  if (isLoading) return <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white p-4 rounded shadow-sm space-y-2 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sprints ({sprints.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Create Sprint
        </button>
      </div>

      {showForm && <CreateSprintForm projectId={projectId} onClose={() => setShowForm(false)} />}

      <div className="space-y-3">
        {sprints.map(sprint => (
          <div key={sprint.id} className="bg-white p-4 rounded shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{sprint.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{sprint._count?.tasks || 0} tasks</p>
              </div>
              <div className="flex gap-2">
                {sprint.status === 'PLANNING' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'start')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Start
                  </button>
                )}
                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => updateSprint(sprint.id, 'complete')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Complete
                  </button>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  sprint.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  sprint.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {sprint.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateSprintForm({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, startDate, endDate }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm mb-4 space-y-3">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sprint name" className="w-full border rounded px-3 py-2" required />
      <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Goal (optional)" className="w-full border rounded px-3 py-2" />
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-3 py-2" required />
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-3 py-2" required />
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Create</button>
        <button type="button" onClick={onClose} className="text-gray-600 text-sm">Cancel</button>
      </div>
    </form>
  );
}
