'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban } from 'lucide-react';

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
      body: JSON.stringify({
        name,
        description,
        supervisorId: supervisorId || undefined,
      }),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to create project. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="proj-name">
          Project name *
        </label>
        <input
          id="proj-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          placeholder="e.g. Customer Portal v2"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="proj-desc">
          Description
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="Briefly describe the project goals and scope…"
        />
      </div>

      {supervisors.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="proj-supervisor">
            Supervisor <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <select
            id="proj-supervisor"
            value={supervisorId}
            onChange={e => setSupervisorId(e.target.value)}
            className="input"
          >
            <option value="">No supervisor assigned</option>
            {supervisors.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary w-full py-2.5"
        >
          <FolderKanban className="w-4 h-4" />
          {loading ? 'Creating project…' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
