'use client';

interface Member {
  role: string;
  userId: string;
  user?: { id: string; name: string; email?: string; avatarUrl?: string | null };
}

interface MembersListProps {
  projectId: string;
  members: Member[];
}

export function MembersList({ projectId, members }: MembersListProps) {
  async function inviteMember(formData: FormData) {
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });

    window.location.reload();
  }

  async function removeMember(userId: string) {
    if (!confirm('Remove this member?')) return;

    await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });

    window.location.reload();
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-4">Members ({members.length})</h2>

      <form action={inviteMember} className="bg-white p-4 rounded shadow-sm mb-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="flex-1 border rounded px-3 py-2"
            required
          />
          <select name="role" className="border rounded px-3 py-2">
            <option value="DEVELOPER">Developer</option>
            <option value="SCRUM_MASTER">Scrum Master</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Invite
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {(members || []).map((member) => (
          <div key={member.userId || member.user?.id || Math.random()} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                {(member.user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{member.user?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{member.user?.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded ${
                member.role === 'SCRUM_MASTER' ? 'bg-blue-100 text-blue-700' :
                member.role === 'DEVELOPER' ? 'bg-gray-100' : 'bg-purple-100 text-purple-700'
              }`}>
                {member.role}
              </span>
              <button
                onClick={() => removeMember(member.userId)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
