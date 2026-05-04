import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { Plus, FolderKanban, CheckSquare, Users } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const res = await apiFetch("/projects");
  const projects = res.ok ? await res.json() : [];

  const totalTasks = projects.reduce(
    (sum: number, p: any) => sum + (p._count?.tasks ?? 0),
    0,
  );
  const totalMembers = projects.reduce((acc: Set<string>, p: any) => {
    (p.members ?? []).forEach((m: any) => acc.add(m.user?.id ?? m.userId));
    return acc;
  }, new Set<string>()).size;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Page header */}
      <header className="page-header">
        <div>
          <h1 className="text-base font-semibold text-stone-900">Dashboard</h1>
          <p className="text-xs text-stone-500">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link href="/projects/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </header>

      <main className="page-content space-y-6">
        {/* Welcome + stats strip */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Welcome back, {session.user?.name?.split(" ")[0] ?? "there"} 👋
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Here&apos;s an overview of your workspace
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {projects.length}
                </p>
                <p className="text-xs text-stone-500 font-medium">
                  Active Projects
                </p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {totalTasks}
                </p>
                <p className="text-xs text-stone-500 font-medium">
                  Total Tasks
                </p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {totalMembers}
                </p>
                <p className="text-xs text-stone-500 font-medium">
                  Team Members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Your Projects
              {projects.length > 0 && (
                <span className="ml-2 text-xs font-normal text-stone-400">
                  {projects.length} total
                </span>
              )}
            </h3>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start managing tasks and sprints with your team."
              actionLabel="Create Project"
              actionHref="/projects/new"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
