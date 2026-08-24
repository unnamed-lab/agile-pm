"use client";

import { useState, useEffect } from "react";
import { GripVertical, User, CheckCircle2, Clock, AlertCircle, CircleDot, Plus, LayoutGrid, ListFilter, SlidersHorizontal, StickyNote, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMoveTask } from "@/hooks/useProjects";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

const COLUMNS = [
  {
    status: "TODO",
    label: "Not Started",
    dotColor: "bg-slate-400",
    columnBg: "bg-slate-100/70 border-slate-200/90",
    headerBg: "bg-slate-200/60 text-slate-800",
  },
  {
    status: "IN_PROGRESS",
    label: "Working on it",
    dotColor: "bg-amber-500 animate-pulse",
    columnBg: "bg-amber-50/50 border-amber-200/70",
    headerBg: "bg-amber-100/80 text-amber-900",
  },
  {
    status: "IN_REVIEW",
    label: "In Review",
    dotColor: "bg-purple-500",
    columnBg: "bg-purple-50/50 border-purple-200/70",
    headerBg: "bg-purple-100/80 text-purple-900",
  },
  {
    status: "DONE",
    label: "Done",
    dotColor: "bg-emerald-500",
    columnBg: "bg-emerald-50/50 border-emerald-200/70",
    headerBg: "bg-emerald-100/80 text-emerald-900",
  },
];

const STICKY_PALETTES: Record<string, { bg: string; border: string; hoverBorder: string; name: string; tape: string }> = {
  yellow: {
    name: "Classic Yellow",
    bg: "bg-[#fefce8]",
    border: "border-[#fef08a]",
    hoverBorder: "hover:border-[#fde047]",
    tape: "bg-amber-300/40 border-amber-400/40",
  },
  peach: {
    name: "Warm Peach",
    bg: "bg-[#fff7ed]",
    border: "border-[#ffedd5]",
    hoverBorder: "hover:border-[#fed7aa]",
    tape: "bg-orange-300/40 border-orange-400/40",
  },
  mint: {
    name: "Fresh Mint",
    bg: "bg-[#ecfdf5]",
    border: "border-[#a7f3d0]",
    hoverBorder: "hover:border-[#6ee7b7]",
    tape: "bg-emerald-300/40 border-emerald-400/40",
  },
  sky: {
    name: "Ice Blue",
    bg: "bg-[#f0f9ff]",
    border: "border-[#bae6fd]",
    hoverBorder: "hover:border-[#7dd3fc]",
    tape: "bg-sky-300/40 border-sky-400/40",
  },
  lavender: {
    name: "Soft Lavender",
    bg: "bg-[#faf5ff]",
    border: "border-[#e9d5ff]",
    hoverBorder: "hover:border-[#d8b4fe]",
    tape: "bg-purple-300/40 border-purple-400/40",
  },
  pink: {
    name: "Pastel Pink",
    bg: "bg-[#fdf2f8]",
    border: "border-[#fbcfe8]",
    hoverBorder: "hover:border-[#f472b6]",
    tape: "bg-pink-300/40 border-pink-400/40",
  },
};

const DEFAULT_PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "pink",
  HIGH: "peach",
  MEDIUM: "yellow",
  LOW: "mint",
};

const PRIORITY_BADGES: Record<string, string> = {
  CRITICAL: "bg-rose-500/10 text-rose-700 border border-rose-500/20 font-bold",
  HIGH: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  LOW: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
};

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-purple-500",
];

function getAvatarBg(name?: string) {
  if (!name) return "bg-slate-400";
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function KanbanBoard({ projectId, tasks = [] }: KanbanBoardProps) {
  const [viewLayout, setViewLayout] = useState<"columns" | "rows">("columns");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [stickyColors, setStickyColors] = useState<Record<string, string>>({});
  const [openColorPickerTaskId, setOpenColorPickerTaskId] = useState<string | null>(null);

  useEffect(() => {
    const savedLayout = localStorage.getItem("kanban_view_layout");
    if (savedLayout === "rows" || savedLayout === "columns") {
      setViewLayout(savedLayout);
    }
    const savedColors = localStorage.getItem("task_sticky_colors");
    if (savedColors) {
      try {
        setStickyColors(JSON.parse(savedColors));
      } catch (e) {}
    }
  }, []);

  const changeLayout = (mode: "columns" | "rows") => {
    setViewLayout(mode);
    localStorage.setItem("kanban_view_layout", mode);
  };

  const setTaskColor = (taskId: string, colorKey: string) => {
    const updated = { ...stickyColors, [taskId]: colorKey };
    setStickyColors(updated);
    localStorage.setItem("task_sticky_colors", JSON.stringify(updated));
    setOpenColorPickerTaskId(null);
  };

  const moveTaskMutation = useMoveTask(projectId);

  // Deduplicate tasks by unique ID
  const uniqueTasks = Array.from(new Map((tasks || []).map((t) => [t.id, t])).values());

  const tasksByStatus = (status: string) => {
    return uniqueTasks.filter((t) => t.status === status);
  };

  async function handleMoveTask(taskId: string, newStatus: string) {
    try {
      await moveTaskMutation.mutateAsync({ taskId, status: newStatus });
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Layout & Sticky Note Settings Toolbar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 px-2">
          <StickyNote className="w-4 h-4 text-emerald-600" />
          <span>Interactive Sticky Note Kanban</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">• Click palette icon to pick sticky note color</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            onClick={() => changeLayout("columns")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewLayout === "columns"
                ? "bg-white text-emerald-700 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <AnimatedIcon icon={LayoutGrid} animation="hover-scale" size={14} />
            <span>Block Columns</span>
          </button>

          <button
            onClick={() => changeLayout("rows")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewLayout === "rows"
                ? "bg-white text-emerald-700 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <AnimatedIcon icon={ListFilter} animation="hover-scale" size={14} />
            <span>Straight-Line Rows</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Polished Sticky Note Columns */}
      {viewLayout === "columns" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus(col.status);
            const isOver = dragOverCol === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverCol !== col.status) {
                    setDragOverCol(col.status);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  if (draggedTaskId) {
                    const task = tasks.find((t) => t.id === draggedTaskId);
                    if (task && task.status !== col.status) {
                      handleMoveTask(draggedTaskId, col.status);
                    }
                    setDraggedTaskId(null);
                  }
                }}
                className={`flex flex-col rounded-2xl border transition-all duration-300 ease-out ${col.columnBg} ${
                  isOver
                    ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-xl scale-[1.01]"
                    : "shadow-xs"
                }`}
              >
                {/* Sleek Column Header */}
                <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-slate-200/50">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="bg-white/80 text-slate-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 p-3 space-y-3.5 min-h-[360px] relative">
                  {isOver && (
                    <div className="absolute inset-2 border-2 border-dashed border-emerald-500/40 rounded-xl pointer-events-none z-10 bg-emerald-500/5" />
                  )}

                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => {
                      const colorKey = stickyColors[task.id] || DEFAULT_PRIORITY_COLORS[task.priority] || "yellow";
                      const palette = STICKY_PALETTES[colorKey] || STICKY_PALETTES.yellow;
                      const priorityBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;
                      const isDraggingThis = draggedTaskId === task.id;
                      const isColorPickerOpen = openColorPickerTaskId === task.id;

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isDraggingThis ? 0.4 : 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ y: -4, rotate: -0.7, boxShadow: "0 12px 28px -4px rgba(0,0,0,0.1)" }}
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          draggable
                          onDragStart={(e: any) => {
                            setDraggedTaskId(task.id);
                            if (e.dataTransfer) {
                              e.dataTransfer.setData("text/plain", task.id);
                              e.dataTransfer.effectAllowed = "move";
                            }
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverCol(null);
                          }}
                          className={`group relative ${palette.bg} rounded-xl border ${palette.border} ${palette.hoverBorder} p-4 cursor-grab active:cursor-grabbing shadow-[2px_4px_12px_rgba(0,0,0,0.05)] transition-all ${
                            isDraggingThis ? "ring-2 ring-emerald-500 border-emerald-500" : ""
                          }`}
                        >
                          {/* Translucent Tape Pin Tab */}
                          <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-2.5 ${palette.tape} backdrop-blur-xs rounded-xs shadow-2xs z-10 pointer-events-none`} />

                          {/* Task Card Top Row */}
                          <div className="flex items-start justify-between gap-2 pt-0.5">
                            <div className="flex items-start gap-1.5 flex-1 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <p className="text-xs font-bold text-slate-900 leading-snug truncate">
                                {task.title}
                              </p>
                            </div>

                            {/* Color Swatch Picker Trigger */}
                            <div className="relative shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenColorPickerTaskId(isColorPickerOpen ? null : task.id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Change Sticky Note Color"
                              >
                                <Palette className="w-3.5 h-3.5" />
                              </button>

                              {/* Color Dropdown Palette */}
                              {isColorPickerOpen && (
                                <div className="absolute right-0 top-6 z-30 bg-white border border-slate-200 rounded-xl p-2 shadow-xl flex items-center gap-1.5 animate-fadeIn">
                                  {Object.entries(STICKY_PALETTES).map(([k, p]) => (
                                    <button
                                      key={k}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskColor(task.id, k);
                                      }}
                                      className={`w-5 h-5 rounded-full border border-slate-300 ${p.bg} hover:scale-125 transition-transform shadow-2xs`}
                                      title={p.name}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer row */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${priorityBadge}`}>
                                {task.priority || "MEDIUM"}
                              </span>
                              {task.storyPoints > 0 && (
                                <span className="bg-white/90 text-slate-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200/60 shadow-2xs">
                                  {task.storyPoints} pts
                                </span>
                              )}
                            </div>

                            {task.assignee ? (
                              <div
                                className={`w-6 h-6 rounded-full ${getAvatarBg(task.assignee.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}
                                title={task.assignee.name}
                              >
                                {task.assignee.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <User className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 text-xs text-slate-400 border border-dashed border-slate-200/80 rounded-xl bg-white/40">
                      <p className="font-medium text-[11px]">Drop sticky notes here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mode 2: Straight Line Rows */
        <div className="space-y-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus(col.status);

            return (
              <div
                key={col.status}
                className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Status Group Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="bg-slate-200 text-slate-600 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Straight Line Task Rows */}
                <div className="divide-y divide-slate-100">
                  {colTasks.map((task) => {
                    const priorityBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors text-xs gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                          <span className="font-semibold text-slate-900 truncate">
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${priorityBadge}`}>
                            {task.priority || "MEDIUM"}
                          </span>

                          {task.storyPoints > 0 && (
                            <span className="bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold px-2 py-0.5 rounded">
                              {task.storyPoints} pts
                            </span>
                          )}

                          {/* Quick Status Select */}
                          <select
                            value={task.status}
                            onChange={(e) => handleMoveTask(task.id, e.target.value)}
                            className="bg-slate-100 border border-slate-200 text-xs py-1 px-2 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="TODO">Not Started</option>
                            <option value="IN_PROGRESS">Working on it</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <div
                              className={`w-6 h-6 rounded-full ${getAvatarBg(task.assignee.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}
                              title={task.assignee.name}
                            >
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
