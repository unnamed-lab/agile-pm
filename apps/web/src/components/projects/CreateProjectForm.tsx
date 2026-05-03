'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Supervisor {
  id: string;
  name: string;
  email: string;
}

export function CreateProjectForm({ supervisors }: { supervisors: Supervisor[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, supervisorId: supervisorId || undefined }),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to create project');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      {supervisors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Supervisor (Optional)</label>
          <select
            value={supervisorId}
            onChange={e => setSupervisorId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">No supervisor</option>
            {supervisors.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
