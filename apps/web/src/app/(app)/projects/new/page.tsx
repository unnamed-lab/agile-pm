import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CreateProjectForm } from '@/components/projects/CreateProjectForm';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/projects/supervisors`, { cache: 'no-store' });
  const supervisors = res.ok ? await res.json() : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Project</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CreateProjectForm supervisors={supervisors} />
      </main>
    </div>
  );
}
