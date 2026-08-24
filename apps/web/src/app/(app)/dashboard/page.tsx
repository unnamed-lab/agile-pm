import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { Plus } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [projectsRes, summaryRes, activityRes] = await Promise.all([
    apiFetch("/projects"),
    apiFetch("/projects/dashboard-summary"),
    apiFetch("/activity/user?limit=20"),
  ]);

  const projects = projectsRes.ok ? await projectsRes.json() : [];
  const summary = summaryRes.ok ? await summaryRes.json() : null;
  const activityLogs = activityRes.ok ? await activityRes.json() : [];

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
          <h1 className="text-base font-bold text-slate-900">Workspace Dashboard</h1>
          <p className="text-xs text-slate-500">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link href="/projects/new" className="btn-primary text-xs font-bold">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </header>

      <main className="page-content">
        <DashboardClient
          user={session.user as any}
          projects={projects}
          summary={summary}
          activityLogs={activityLogs}
        />
      </main>
    </>
  );
}
