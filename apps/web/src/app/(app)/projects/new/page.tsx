import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const res = await apiFetch("/users/supervisors");
  const supervisors = res.ok ? await res.json() : [];

  return (
    <>
      <header className="page-header">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="text-stone-500 hover:text-stone-800 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-semibold text-stone-900">New Project</span>
        </div>
      </header>

      <main className="page-content">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-stone-900">
              Create a project
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Set up your project and start managing tasks with your team.
            </p>
          </div>
          <CreateProjectForm supervisors={supervisors} />
        </div>
      </main>
    </>
  );
}
