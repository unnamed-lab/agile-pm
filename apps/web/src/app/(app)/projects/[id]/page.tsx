import { notFound, redirect } from 'next/navigation';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ProjectPageProps {
  params: { id: string };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/projects/${params.id}`, { cache: 'no-store' });

  if (!res.ok) notFound();

  const project = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <ProjectTabs project={project} />
      </main>
    </div>
  );
}
