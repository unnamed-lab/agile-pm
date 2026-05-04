import Link from 'next/link';
import { CheckSquare, Zap, Users, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    members: Array<{
      role: string;
      user: { id: string; name: string; avatarUrl?: string | null };
    }>;
    _count: { tasks: number; sprints: number };
  };
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProjectCard({ project }: ProjectCardProps) {
  const activeSprints = project._count.sprints;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div className="card p-5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col h-full min-h-[180px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <CheckSquare className="w-3.5 h-3.5 text-stone-400" />
            <span>{project._count.tasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Zap className="w-3.5 h-3.5 text-stone-400" />
            <span>{activeSprints} sprints</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span>{project.members.length}</span>
          </div>

          {/* Avatar stack */}
          {project.members.length > 0 && (
            <div className="flex -space-x-1.5 ml-auto">
              {project.members.slice(0, 4).map(member => (
                <div
                  key={member.user.id}
                  className={`w-6 h-6 rounded-full ${avatarColor(member.user.name)} flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white`}
                  title={member.user.name}
                >
                  {getInitials(member.user.name)}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-semibold text-stone-600 border-2 border-white">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
