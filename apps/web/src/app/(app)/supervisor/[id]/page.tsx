import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { GanttChart } from '@/components/projects/GanttChart';
import { WBSChart } from '@/components/projects/WBSChart';
import { BurndownChart } from '@/components/projects/BurndownChart';
import { ParetoChart } from '@/components/projects/ParetoChart';
import { ControlChart } from '@/components/projects/ControlChart';
import { PERTChart } from '@/components/projects/PERTChart';
import { CauseEffectDiagram } from '@/components/projects/CauseEffectDiagram';

interface SupervisorPageProps {
  params: { id: string };
}

export default async function SupervisorPage({ params }: SupervisorPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/projects/${params.id}`, { cache: 'no-store' });
  
  if (!res.ok) notFound();
  
  const project = await res.json();
  const isMember = project.members?.some((m: any) => m.userId === (session.user as any)?.id);
  if (!isMember) redirect('/dashboard');

  const taskStats = {
    total: project.tasks?.length || 0,
    todo: project.tasks?.filter((t: any) => t.status === 'TODO').length || 0,
    inProgress: project.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0,
    inReview: project.tasks?.filter((t: any) => t.status === 'IN_REVIEW').length || 0,
    done: project.tasks?.filter((t: any) => t.status === 'DONE').length || 0,
  };

  const completionRate = taskStats.total > 0
    ? Math.round((taskStats.done / taskStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: taskStats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'In Progress', value: taskStats.inProgress, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'In Review', value: taskStats.inReview, color: 'bg-purple-50 text-purple-700' },
            { label: 'Completed', value: taskStats.done, color: 'bg-green-50 text-green-700' },
          ].map(stat => (
            <div key={stat.label} className={`p-4 rounded-lg ${stat.color}`}>
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Project Completion</h3>
            <span className="text-sm text-gray-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Sprint Schedule (Gantt)</h3>
          <GanttChart sprints={project.sprints} />
        </div>

        {/* WBS Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Work Breakdown Structure</h3>
          <WBSChart tasks={project.tasks} />
        </div>

        {/* PERT Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">PERT Chart (Dependencies)</h3>
          <PERTChart tasks={project.tasks?.map((t: any) => ({
            id: t.id,
            title: t.title,
            storyPoints: t.storyPoints,
            position: t.position || 0,
          })) || []} />
        </div>

        {/* Burndown Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Sprint Burndown</h3>
          <BurndownChart
            data={(project.sprints || [])
              .filter((s: any) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
              .flatMap((s: any) => [
                { date: new Date(s.startDate).toLocaleDateString(), estimated: (s.tasks || []).reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0), actual: (s.tasks || []).filter((t: any) => t.status === 'DONE').reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0) },
              ])}
            totalStoryPoints={(project.tasks || []).reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0)}
          />
        </div>

        {/* Pareto Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Pareto Chart (Task Priority Distribution)</h3>
          <ParetoChart
            data={[
              { category: 'HIGH', count: (project.tasks || []).filter((t: any) => t.priority === 'HIGH').length },
              { category: 'MEDIUM', count: (project.tasks || []).filter((t: any) => t.priority === 'MEDIUM').length },
              { category: 'LOW', count: (project.tasks || []).filter((t: any) => t.priority === 'LOW').length },
            ]}
          />
        </div>

        {/* Control Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Control Chart (Velocity Stability)</h3>
          <ControlChart
            data={(project.sprints || []).map((s: any) => ({
              sprint: s.name,
              actual: (s.tasks || []).filter((t: any) => t.status === 'DONE').length,
              estimated: (s.tasks || []).length,
            }))}
          />
        </div>

        {/* Cause-Effect Diagram */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Cause-Effect Diagram (Common Issues)</h3>
          <CauseEffectDiagram
            problem="Delayed Delivery"
            data={[
              { category: 'People', causes: ['Skill gap', 'Resource shortage', 'Miscommunication'] },
              { category: 'Process', causes: ['Poor estimation', 'Scope creep', 'No code review'] },
              { category: 'Technology', causes: ['Technical debt', 'Tool limitations', 'Integration issues'] },
              { category: 'Environment', causes: ['Changing requirements', 'Stakeholder pressure', 'Budget cuts'] },
            ]}
          />
        </div>

        {/* Team Members */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Team ({project.members?.length || 0})</h3>
          <div className="space-y-2">
            {(project.members || []).map((member: any) => (
              <div key={member.userId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {member.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">{member.user?.email || 'No email'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  member.role === 'SCRUM_MASTER' ? 'bg-blue-100 text-blue-700' :
                  member.role === 'DEVELOPER' ? 'bg-gray-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
