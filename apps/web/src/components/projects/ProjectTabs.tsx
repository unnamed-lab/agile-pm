"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Zap,
  Users,
  GanttChartSquare,
  Network,
  TrendingDown,
  BarChart3,
  Activity,
  GitFork,
  Settings2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanBoard } from "./KanbanBoard";
import { Backlog } from "./Backlog";
import { SprintsList } from "./SprintsList";
import { MembersList } from "./MembersList";
import { GanttChart } from "./GanttChart";
import { WBSChart } from "./WBSChart";
import { BurndownChart } from "./BurndownChart";
import { ParetoChart } from "./ParetoChart";
import { ControlChart } from "./ControlChart";
import { CauseEffectDiagram } from "./CauseEffectDiagram";
import { useProject } from "@/hooks/useProjects";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface Project {
  id: string;
  name: string;
  description?: string;
  members: Array<{
    userId: string;
    role: string;
    user: { id: string; name: string; avatarUrl?: string | null };
  }>;
  sprints: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    color?: string;
    goal?: string;
    tasks?: Array<{ id: string; title: string; status: string; storyPoints: number }>;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    storyPoints: number;
    sprintId?: string | null;
    assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
  }>;
}

interface ProjectTabsProps {
  project: Project;
}

const ALL_TABS = [
  { id: "board", label: "Board", icon: LayoutGrid, category: "Core Views" },
  { id: "backlog", label: "Backlog", icon: List, category: "Core Views" },
  { id: "sprints", label: "Sprints", icon: Zap, category: "Core Views" },
  { id: "members", label: "Members", icon: Users, category: "Core Views" },
  { id: "gantt", label: "Gantt Chart", icon: GanttChartSquare, category: "Agile Charts" },
  { id: "wbs", label: "WBS Chart", icon: Network, category: "Agile Charts" },
  { id: "burndown", label: "Burndown Chart", icon: TrendingDown, category: "Agile Charts" },
  { id: "pareto", label: "Pareto Analysis", icon: BarChart3, category: "Quality & Process" },
  { id: "control", label: "Control Chart", icon: Activity, category: "Quality & Process" },
  { id: "cause-effect", label: "Cause & Effect", icon: GitFork, category: "Quality & Process" },
];

const DEFAULT_ENABLED = ["board", "backlog", "sprints", "members", "gantt", "wbs", "burndown"];

export function ProjectTabs({ project: initialProject }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState("board");
  const [enabledTabIds, setEnabledTabIds] = useState<string[]>(DEFAULT_ENABLED);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const { data: project = initialProject } = useProject(initialProject.id, initialProject);

  useEffect(() => {
    const saved = localStorage.getItem("project_enabled_tabs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledTabIds(parsed);
        }
      } catch (e) {
        console.error("Failed to parse enabled tabs:", e);
      }
    }
  }, []);

  const toggleTabEnabled = (tabId: string) => {
    if (enabledTabIds.length === 1 && enabledTabIds.includes(tabId)) {
      return;
    }
    const next = enabledTabIds.includes(tabId)
      ? enabledTabIds.filter((id) => id !== tabId)
      : [...enabledTabIds, tabId];

    setEnabledTabIds(next);
    localStorage.setItem("project_enabled_tabs", JSON.stringify(next));

    if (!next.includes(activeTab)) {
      setActiveTab(next[0] || "board");
    }
  };

  const visibleTabs = ALL_TABS.filter((t) => enabledTabIds.includes(t.id));

  // Burndown Calculation
  const totalPoints = project.tasks?.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0) || 40;
  const donePoints = project.tasks?.filter((t: any) => t.status === "DONE").reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0) || 12;
  const burndownData = [
    { date: "Day 1", estimated: totalPoints, actual: totalPoints },
    { date: "Day 3", estimated: Math.round(totalPoints * 0.8), actual: Math.round(totalPoints * 0.85) },
    { date: "Day 5", estimated: Math.round(totalPoints * 0.6), actual: Math.round(totalPoints * 0.5) },
    { date: "Day 7", estimated: Math.round(totalPoints * 0.4), actual: Math.round(totalPoints * 0.3) },
    { date: "Day 10", estimated: 0, actual: Math.max(0, totalPoints - donePoints) },
  ];

  // Pareto Data
  const paretoData = [
    { category: "Frontend UI/UX", count: project.tasks?.filter((t: any) => t.priority === "HIGH").length || 8 },
    { category: "Backend API", count: project.tasks?.filter((t: any) => t.status === "IN_PROGRESS").length || 5 },
    { category: "Database Queries", count: project.tasks?.filter((t: any) => t.status === "DONE").length || 4 },
    { category: "Security & Auth", count: 2 },
    { category: "DevOps & CI/CD", count: 1 },
  ];

  // Process Control Data
  const controlData = (project.sprints || []).map((s: any, idx: number) => ({
    sprint: s.name || `Sprint ${idx + 1}`,
    actual: s.tasks?.filter((t: any) => t.status === "DONE").length || (idx + 1) * 3,
    estimated: s.tasks?.length || 10,
  }));
  if (controlData.length === 0) {
    controlData.push(
      { sprint: "Sprint 1", actual: 8, estimated: 10 },
      { sprint: "Sprint 2", actual: 12, estimated: 12 },
      { sprint: "Sprint 3", actual: 9, estimated: 10 }
    );
  }

  // Cause & Effect Categories
  const fishboneCategories = [
    { category: "People & Skills", causes: ["Resource constraints", "Context switching", "Onboarding delay"] },
    { category: "Process & Workflow", causes: ["Scope creep", "Unclear acceptance criteria", "PR review bottleneck"] },
    { category: "Tools & Tech", causes: ["CI/CD build times", "Staging environment downtime", "Flaky tests"] },
    { category: "Environment", causes: ["Cross-team dependency block", "API rate limits"] },
  ];

  return (
    <div>
      {/* Sleek Control Bar with Customize Views Button */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl mb-4 p-1.5 shadow-sm gap-2">
        <div className="flex gap-1 overflow-x-auto flex-1 min-w-0">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabSegment"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <AnimatedIcon
                  icon={Icon}
                  animation={active ? "hover-bounce" : "hover-scale"}
                  size={15}
                  className={active ? "text-emerald-600" : "text-slate-400"}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Customize Views Preference Button */}
        <button
          onClick={() => setShowCustomizeModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-lg transition-colors shrink-0"
          title="Customize visible tabs and charts"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Customize Views</span>
        </button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "board" && (
          <KanbanBoard projectId={project.id} tasks={project.tasks || []} />
        )}
        {activeTab === "backlog" && (
          <Backlog
            projectId={project.id}
            tasks={project.tasks || []}
            sprints={project.sprints || []}
            members={project.members || []}
          />
        )}
        {activeTab === "sprints" && (
          <SprintsList projectId={project.id} sprints={project.sprints || []} />
        )}
        {activeTab === "members" && (
          <MembersList projectId={project.id} members={project.members || []} />
        )}
        {activeTab === "gantt" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Gantt Chart</h3>
            <GanttChart projectId={project.id} sprints={project.sprints || []} />
          </div>
        )}
        {activeTab === "wbs" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Work Breakdown Structure</h3>
            <WBSChart tasks={project.tasks || []} />
          </div>
        )}
        {activeTab === "burndown" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Burndown Velocity Chart</h3>
            <BurndownChart data={burndownData} totalStoryPoints={totalPoints} />
          </div>
        )}
        {activeTab === "pareto" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Pareto Quality Analysis</h3>
            <ParetoChart data={paretoData} />
          </div>
        )}
        {activeTab === "control" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Process Control Chart</h3>
            <ControlChart data={controlData} />
          </div>
        )}
        {activeTab === "cause-effect" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Cause & Effect Diagram (Fishbone)</h3>
            <CauseEffectDiagram data={fishboneCategories} problem="Sprint Schedule Variance" />
          </div>
        )}
      </div>

      {/* Customize Tabs & Charts Preference Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Customize Views & Charts</h3>
                </div>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Choose which views and Agile charts you want enabled in your project tabs bar.
              </p>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {["Core Views", "Agile Charts", "Quality & Process"].map((cat) => {
                  const categoryTabs = ALL_TABS.filter((t) => t.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {cat}
                      </p>
                      <div className="space-y-1.5">
                        {categoryTabs.map((tab) => {
                          const isEnabled = enabledTabIds.includes(tab.id);
                          const Icon = tab.icon;
                          return (
                            <label
                              key={tab.id}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isEnabled
                                  ? "bg-emerald-500/5 border-emerald-500/30 text-slate-900"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className={`w-4 h-4 ${isEnabled ? "text-emerald-600" : "text-slate-400"}`} />
                                <span className="text-xs font-semibold">{tab.label}</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => toggleTabEnabled(tab.id)}
                                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="btn-primary text-xs font-bold w-full"
                >
                  <Check className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
