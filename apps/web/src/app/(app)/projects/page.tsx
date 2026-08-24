import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ProjectsListClient } from "./ProjectsListClient";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const res = await apiFetch("/projects");
  const projects = res.ok ? await res.json() : [];

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Projects Workspace</h1>
            <p className="text-xs text-slate-500">Overview and access all active engineering projects</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link href="/projects/new" className="btn-primary text-xs font-bold">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content">
        <ProjectsListClient projects={projects} userId={(session.user as any).id} />
      </main>
    </>
  );
}
