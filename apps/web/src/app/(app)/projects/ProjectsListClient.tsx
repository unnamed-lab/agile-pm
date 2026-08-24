"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, FolderKanban, SlidersHorizontal, Sparkles, FolderGit2 } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  members: Array<{
    role: string;
    user: { id: string; name: string; avatarUrl?: string | null };
  }>;
  _count: { tasks: number; sprints: number };
}

interface ProjectsListClientProps {
  projects: Project[];
  userId: string;
}

export function ProjectsListClient({ projects = [], userId }: ProjectsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "scrum_master">("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterRole === "scrum_master") {
      const isScrumMaster = project.members.some(
        (m) => (m.user?.id === userId || (m as any).userId === userId) && m.role === "SCRUM_MASTER"
      );
      return matchesSearch && isScrumMaster;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filterRole === "all" ? "bg-white shadow-2xs text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilterRole("scrum_master")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filterRole === "scrum_master" ? "bg-white shadow-2xs text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Managed by Me
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            searchQuery
              ? `No projects match "${searchQuery}". Try clearing your search filter.`
              : "Create your first project to start managing tasks and sprints with your team."
          }
          actionLabel="Create Project"
          actionHref="/projects/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project as any} />
          ))}
        </div>
      )}
    </div>
  );
}
