'use client';

import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
  role: string;
  userId: string;
  user?: { id: string; name: string; email?: string; avatarUrl?: string | null };
}

interface MembersListProps {
  projectId: string;
  members: Member[];
}

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-stone-500',
  'bg-slate-500',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

const ROLE_CONFIG = {
  SCRUM_MASTER: { label: 'Scrum Master', className: 'badge-teal' },
  DEVELOPER: { label: 'Developer', className: 'badge-stone' },
  PRODUCT_OWNER: { label: 'Product Owner', className: 'badge-sky' },
} as const;

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
    if (!confirm('Remove this member from the project?')) return;
    await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
    window.location.reload();
  }

  return (
    <div>
      {/* Invite form */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-600" />
          Invite Member
        </h3>
        <form action={inviteMember}>
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder="colleague@company.com"
              className="input flex-1"
              required
            />
            <select
              name="role"
              className="input w-auto min-w-[160px]"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="SCRUM_MASTER">Scrum Master</option>
              <option value="PRODUCT_OWNER">Product Owner</option>
            </select>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Invite
            </button>
          </div>
        </form>
      </div>

      {/* Member list */}
      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">
          Team Members
          <span className="ml-1.5 text-xs font-normal text-stone-400">
            ({members.length})
          </span>
        </h2>

        <div className="space-y-2">
          {members.length === 0 && (
            <div className="card p-8 text-center text-stone-500 text-sm">
              No members yet.
            </div>
          )}
          {(members ?? []).map(member => {
            const name = member.user?.name ?? 'Unknown';
            const roleKey = member.role as keyof typeof ROLE_CONFIG;
            const roleCfg = ROLE_CONFIG[roleKey];
            return (
              <div
                key={member.userId ?? member.user?.id}
                className="card px-4 py-3 flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${avatarColor(name)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{name}</p>
                    <p className="text-xs text-stone-500 truncate">
                      {member.user?.email ?? ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={roleCfg?.className ?? 'badge-stone'}>
                    {roleCfg?.label ?? member.role}
                  </span>
                  <button
                    onClick={() => removeMember(member.userId)}
                    className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
