import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import {
  CheckSquare,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { GanttChart } from "@/components/projects/GanttChart";
import { WBSChart } from "@/components/projects/WBSChart";
import { BurndownChart } from "@/components/projects/BurndownChart";
import { ParetoChart } from "@/components/projects/ParetoChart";
import { ControlChart } from "@/components/projects/ControlChart";
import { PERTChart } from "@/components/projects/PERTChart";
import { CauseEffectDiagram } from "@/components/projects/CauseEffectDiagram";

interface SupervisorPageProps {
  params: { id: string };
}

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-stone-500",
];
function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  SCRUM_MASTER: { label: "Scrum Master", className: "badge-teal" },
  DEVELOPER: { label: "Developer", className: "badge-stone" },
  PRODUCT_OWNER: { label: "Product Owner", className: "badge-sky" },
};

export default async function SupervisorPage({ params }: SupervisorPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [projectRes, tasksRes] = await Promise.all([
    apiFetch(`/projects/${params.id}`),
    apiFetch(`/projects/${params.id}/tasks`),
  ]);

  if (!projectRes.ok) notFound();

  const project = await projectRes.json();
  const tasks = tasksRes.ok ? await tasksRes.json() : [];
  project.tasks = tasks;
  const isMember = project.members?.some(
    (m: any) => m.userId === (session.user as any)?.id,
  );
  if (!isMember) redirect("/dashboard");

  const taskStats = {
    total: project.tasks?.length ?? 0,
    todo: project.tasks?.filter((t: any) => t.status === "TODO").length ?? 0,
    inProgress:
      project.tasks?.filter((t: any) => t.status === "IN_PROGRESS").length ?? 0,
    inReview:
      project.tasks?.filter((t: any) => t.status === "IN_REVIEW").length ?? 0,
    done: project.tasks?.filter((t: any) => t.status === "DONE").length ?? 0,
  };

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Tasks",
      value: taskStats.total,
      icon: CheckSquare,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      label: "In Progress",
      value: taskStats.inProgress,
      icon: ArrowRight,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "In Review",
      value: taskStats.inReview,
      icon: Eye,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      label: "Completed",
      value: taskStats.done,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <>
      {/* Page header */}
      <header className="page-header">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link
            href="/dashboard"
            className="text-stone-500 hover:text-stone-800 transition-colors shrink-0"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link
            href={`/projects/${params.id}`}
            className="text-stone-500 hover:text-stone-800 transition-colors truncate"
          >
            {project.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-semibold text-stone-900 shrink-0">
            Analytics
          </span>
        </div>
      </header>

      <main className="page-content space-y-5">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{value}</p>
                <p className="text-xs text-stone-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Completion progress */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-stone-700">
              Project Completion
            </h3>
            <span className="text-sm font-semibold text-emerald-700">
              {completionRate}%
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-400">
            <span>{taskStats.done} completed</span>
            <span>{taskStats.total - taskStats.done} remaining</span>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Sprint Schedule (Gantt)
            </h3>
            <GanttChart sprints={project.sprints} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Work Breakdown Structure
            </h3>
            <WBSChart tasks={project.tasks} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Sprint Burndown
            </h3>
            <BurndownChart
              data={project.sprints
                ?.filter(
                  (s: any) => s.status === "ACTIVE" || s.status === "COMPLETED",
                )
                .flatMap((s: any) => [
                  {
                    date: new Date(s.startDate).toLocaleDateString(),
                    estimated: (s.tasks ?? []).reduce(
                      (sum: number, t: any) => sum + (t.storyPoints ?? 0),
                      0,
                    ),
                    actual: (s.tasks ?? [])
                      .filter((t: any) => t.status === "DONE")
                      .reduce(
                        (sum: number, t: any) => sum + (t.storyPoints ?? 0),
                        0,
                      ),
                  },
                ])}
              totalStoryPoints={(project.tasks ?? []).reduce(
                (sum: number, t: any) => sum + (t.storyPoints ?? 0),
                0,
              )}
            />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              PERT Chart (Dependencies)
            </h3>
            <PERTChart
              tasks={(project.tasks ?? []).map((t: any) => ({
                id: t.id,
                title: t.title,
                storyPoints: t.storyPoints,
                position: t.position ?? 0,
              }))}
            />
          </div>
        </div>

        {/* Full-width charts */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Pareto Chart — Task Priority Distribution
          </h3>
          <ParetoChart
            data={[
              {
                category: "HIGH",
                count: (project.tasks ?? []).filter(
                  (t: any) => t.priority === "HIGH",
                ).length,
              },
              {
                category: "MEDIUM",
                count: (project.tasks ?? []).filter(
                  (t: any) => t.priority === "MEDIUM",
                ).length,
              },
              {
                category: "LOW",
                count: (project.tasks ?? []).filter(
                  (t: any) => t.priority === "LOW",
                ).length,
              },
            ]}
          />
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Control Chart — Velocity Stability
          </h3>
          <ControlChart
            data={(project.sprints ?? []).map((s: any) => ({
              sprint: s.name,
              actual: (s.tasks ?? []).filter((t: any) => t.status === "DONE")
                .length,
              estimated: (s.tasks ?? []).length,
            }))}
          />
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Cause-Effect Diagram — Common Issues
          </h3>
          <CauseEffectDiagram
            problem="Delayed Delivery"
            data={[
              {
                category: "People",
                causes: ["Skill gap", "Resource shortage", "Miscommunication"],
              },
              {
                category: "Process",
                causes: ["Poor estimation", "Scope creep", "No code review"],
              },
              {
                category: "Technology",
                causes: [
                  "Technical debt",
                  "Tool limitations",
                  "Integration issues",
                ],
              },
              {
                category: "Environment",
                causes: [
                  "Changing requirements",
                  "Stakeholder pressure",
                  "Budget cuts",
                ],
              },
            ]}
          />
        </div>

        {/* Team members */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Team
            <span className="ml-1.5 text-xs font-normal text-stone-400">
              ({project.members?.length ?? 0})
            </span>
          </h3>
          <div className="space-y-2">
            {(project.members ?? []).map((member: any) => {
              const name = member.user?.name ?? "Unknown";
              const roleCfg = ROLE_CONFIG[member.role];
              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${avatarColor(name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {member.user?.email ?? ""}
                      </p>
                    </div>
                  </div>
                  <span className={roleCfg?.className ?? "badge-stone"}>
                    {roleCfg?.label ?? member.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
