'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  priority: string;
  storyPoints: number;
  sprintId?: string | null;
  assignee?: { id: string; name: string } | null;
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

export function Backlog({ projectId, tasks, sprints = [] }: BacklogProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
    router.refresh();
  }

  async function assignToSprint(taskId: string, sprintId: string) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprintId }),
    });
    router.refresh();
  }

  const backlogTasks = tasks.filter(t => !t.sprintId);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Backlog ({backlogTasks.length} tasks)</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Add Task
        </button>
      </div>

      {showForm && <CreateTaskForm projectId={projectId} sprints={sprints} onClose={() => setShowForm(false)} />}

      <div className="space-y-2">
        {backlogTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks in backlog</p>
          </div>
        ) : (
          backlogTasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'HIGH' ? 'bg-red-100' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">{task.storyPoints} pts</span>
                  {task.assignee && <span className="text-sm text-gray-600">{task.assignee.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sprints.filter(s => s.status === 'PLANNING').length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) assignToSprint(task.id, e.target.value);
                    }}
                    className="text-xs border rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="">Assign to sprint...</option>
                    {sprints.filter(s => s.status === 'PLANNING').map(sprint => (
                      <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                    ))}
                  </select>
                )}
                <button onClick={() => deleteTask(task.id)} className="text-red-600 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateTaskForm({ projectId, sprints, onClose }: { projectId: string; sprints: Sprint[]; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, status: 'TODO' }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm mb-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full border rounded px-3 py-2"
        required
      />
      <select value={priority} onChange={e => setPriority(e.target.value)} className="border rounded px-3 py-2">
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Create
        </button>
        <button type="button" onClick={onClose} className="text-gray-600 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
