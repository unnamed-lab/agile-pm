import { notFound, redirect } from "next/navigation";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const res = await apiFetch(`/projects/${id}`);
  if (!res.ok) notFound();

  const project = await res.json();

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
          <span className="font-semibold text-stone-900 truncate">
            {project.name}
          </span>
          {project.description && (
            <>
              <span className="text-stone-300 shrink-0 hidden md:block">·</span>
              <span className="text-stone-400 text-xs truncate hidden md:block">
                {project.description}
              </span>
            </>
          )}
        </div>
        <Link
          href={`/supervisor/${id}`}
          className="btn-secondary shrink-0"
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Link>
      </header>

      <main className="page-content">
        <ProjectTabs project={project} />
      </main>
    </>
  );
}
