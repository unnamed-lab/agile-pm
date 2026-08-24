"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  Zap,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  BarChart3,
  Activity,
  ChevronRight,
  Sparkles,
  Flame,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  members: Array<{
    userId?: string;
    role: string;
    user: { id: string; name: string; avatarUrl?: string | null };
  }>;
  sprints?: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    storyPoints: number;
    assigneeId?: string | null;
    assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  }>;
  _count: { tasks: number; sprints: number };
}

interface DashboardSummary {
  activeProjectsCount: number;
  totalTasksCount: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  overallProgressPercent: number;
  totalSprintsCount: number;
  totalMembersCount: number;
  myAssignedTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    storyPoints: number;
    projectId: string;
    projectName?: string;
  }>;
  allTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    storyPoints: number;
    projectId: string;
    projectName?: string;
  }>;
}

interface ActivityLog {
  id: string;
  action: string;
  metadata?: any;
  createdAt: string;
  project?: { name: string };
  user?: { name: string; avatarUrl?: string | null };
}

interface DashboardClientProps {
  user: User;
  projects: Project[];
  summary?: DashboardSummary | null;
  activityLogs: ActivityLog[];
}

const PRIORITY_BADGES: Record<string, string> = {
  CRITICAL: "bg-rose-500/10 text-rose-700 border border-rose-500/20 font-bold",
  HIGH: "bg-orange-500/10 text-orange-700 border border-orange-500/20 font-semibold",
  MEDIUM: "bg-amber-500/10 text-amber-700 border border-amber-500/20 font-medium",
  LOW: "bg-slate-500/10 text-slate-700 border border-slate-500/20 font-medium",
};

const STATUS_ICONS: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  DONE: { color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Done", icon: CheckCircle2 },
  IN_PROGRESS: { color: "text-amber-600", bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Working", icon: Clock },
  IN_REVIEW: { color: "text-purple-600", bg: "bg-purple-50 text-purple-700 border-purple-200", label: "In Review", icon: AlertCircle },
  TODO: { color: "text-slate-600", bg: "bg-slate-50 text-slate-700 border-slate-200", label: "To Do", icon: Clock },
};

function formatRelativeTime(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getActionLabel(action: string, metadata?: any) {
  switch (action) {
    case "PROJECT_CREATED":
      return `Created project ${metadata?.projectName ?? ""}`;
    case "SPRINT_CREATED":
      return `Created sprint ${metadata?.sprintName ?? ""}`;
    case "SPRINT_STARTED":
      return `Started ${metadata?.sprintName ?? "a sprint"}`;
    case "SPRINT_COMPLETED":
      return `Completed ${metadata?.sprintName ?? "a sprint"}`;
    case "TASK_CREATED":
      return `Created task ${metadata?.taskTitle ?? ""}`;
    case "TASK_COMPLETED":
      return `Completed task ${metadata?.taskTitle ?? ""}`;
    case "MEMBER_ADDED":
      return `Invited ${metadata?.addedUserName ?? "a member"}`;
    default:
      return action.replace(/_/g, " ").toLowerCase();
  }
}

export function DashboardClient({ user, projects = [], summary, activityLogs = [] }: DashboardClientProps) {
  const [filterTab, setFilterTab] = useState<"all" | "assigned">("all");

  // Fallback task mapping if summary API is not available
  const clientAllTasks = summary?.allTasks ?? projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({
      ...t,
      projectName: p.name,
      projectId: p.id,
    }))
  );

  const myAssignedTasks = summary?.myAssignedTasks ?? clientAllTasks.filter(
    (t: any) => t.assigneeId === user.id || t.assignee?.id === user.id
  );

  const completedTasksCount = summary?.completedTasksCount ?? clientAllTasks.filter((t: any) => t.status === "DONE").length;
  const inProgressTasksCount = summary?.inProgressTasksCount ?? clientAllTasks.filter((t: any) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length;
  const overallProgressPercent = summary?.overallProgressPercent ?? (clientAllTasks.length > 0 ? Math.round((completedTasksCount / clientAllTasks.length) * 100) : 0);

  const totalTasksCount = summary?.totalTasksCount ?? projects.reduce((s, p) => s + (p._count?.tasks ?? 0), 0);
  const totalSprintsCount = summary?.totalSprintsCount ?? projects.reduce((s, p) => s + (p._count?.sprints ?? 0), 0);

  const totalMembersCount = summary?.totalMembersCount ?? projects.reduce((acc: Set<string>, p: any) => {
    (p.members ?? []).forEach((m: any) => acc.add(m.user?.id ?? m.userId));
    return acc;
  }, new Set<string>()).size;

  const displayTasks = filterTab === "assigned" ? myAssignedTasks : clientAllTasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2 text-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineering Workspace Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name?.split(" ")[0] ?? "Team"}!
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-xl">
              You have <span className="font-bold text-white">{inProgressTasksCount} tasks in progress</span> and{" "}
              <span className="font-bold text-white">{projects.length} active projects</span> running. Overall project completion is at{" "}
              <span className="font-bold text-emerald-200">{overallProgressPercent}%</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/projects/new"
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Box Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-2xs hover:border-emerald-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Active Projects</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{summary?.activeProjectsCount ?? projects.length}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ShieldCheck className="w-3 h-3" /> All Healthy
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Tasks Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-2xs hover:border-sky-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Total Tasks</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalTasksCount}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600">
              <CheckCircle2 className="w-3 h-3" /> {completedTasksCount} Done ({overallProgressPercent}%)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-500/20 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Active Sprints Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-2xs hover:border-amber-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Active Sprints</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalSprintsCount}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Flame className="w-3 h-3" /> Velocity On Target
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Team Members Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-2xs hover:border-purple-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Team Members</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalMembersCount}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
              <UserCheck className="w-3 h-3" /> Active Contributors
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Projects & Assigned Work */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Section */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Your Engineering Projects</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {projects.length}
                </span>
              </div>
              <Link href="/projects/new" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Create Project
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project as any} />
              ))}
            </div>
          </div>

          {/* Actionable Work Tasks Widget */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900">Tasks & Deliverables Overview</h2>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterTab === "all" ? "bg-white shadow-2xs text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All Tasks ({clientAllTasks.length})
                </button>
                <button
                  onClick={() => setFilterTab("assigned")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterTab === "assigned" ? "bg-white shadow-2xs text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Assigned to Me ({myAssignedTasks.length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {displayTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active tasks found in this view.
                </div>
              ) : (
                displayTasks.map((task: any) => {
                  const sCfg = STATUS_ICONS[task.status] || STATUS_ICONS.TODO;
                  const StatusIcon = sCfg.icon;

                  return (
                    <div
                      key={task.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <StatusIcon className={`w-4 h-4 shrink-0 ${sCfg.color}`} />
                        <div className="truncate">
                          <Link
                            href={`/projects/${task.projectId}`}
                            className="font-bold text-xs text-slate-900 hover:text-emerald-600 truncate block transition-colors"
                          >
                            {task.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.projectName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sCfg.bg} font-semibold`}>
                          {sCfg.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_BADGES[task.priority] || "bg-slate-100 text-slate-600"}`}>
                          {task.priority}
                        </span>
                        {task.storyPoints ? (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                            {task.storyPoints}pt
                          </span>
                        ) : null}
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="p-1 text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Workspace Activity Stream & Sprint Progress */}
        <div className="space-y-6">
          {/* Sprint Completion Progress */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Sprint Completion Rate</h3>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 font-mono">{overallProgressPercent}%</span>
            </div>

            {/* Progress Fill Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
              <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Completed</p>
                <p className="text-base font-extrabold text-emerald-700 font-mono">{completedTasksCount}</p>
              </div>
              <div className="p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                <p className="text-[10px] font-bold text-amber-800 uppercase">In Progress</p>
                <p className="text-base font-extrabold text-amber-700 font-mono">{inProgressTasksCount}</p>
              </div>
            </div>
          </div>

          {/* Realtime Activity Stream */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Workspace Activity</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Live Feed</span>
            </div>

            <div className="space-y-3">
              {activityLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No recent activity logged.
                </div>
              ) : (
                activityLogs.slice(0, 7).map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-slate-200/60">
                      {log.user?.name ? log.user.name[0].toUpperCase() : "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold leading-tight">
                        <span className="font-bold text-slate-900">{log.user?.name ?? "User"}</span>{" "}
                        <span className="text-slate-600">{getActionLabel(log.action, log.metadata)}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
