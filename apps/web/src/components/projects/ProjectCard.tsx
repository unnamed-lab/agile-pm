import Link from 'next/link';

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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{project._count.tasks} tasks</span>
          <span>{project.members.length} members</span>
          <span>{project._count.sprints} sprints</span>
        </div>
        <div className="mt-4 flex -space-x-2">
          {project.members.slice(0, 5).map(member => (
            <div
              key={member.user.id}
              className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs border-2 border-white"
              title={member.user.name}
            >
              {member.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
              +{project.members.length - 5}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
