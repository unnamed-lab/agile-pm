"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Zap, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, HelpCircle, GripHorizontal, ZoomIn, ZoomOut } from "lucide-react";
import { useEditSprintDetails, useUpdateTask } from "@/hooks/useProjects";

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  storyPoints?: number;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  durationDays?: number;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  goal?: string;
  tasks?: Task[];
}

interface GanttChartProps {
  projectId?: string;
  sprints: Sprint[];
  projectStartDate?: string | Date;
  projectEndDate?: string | Date;
}

const SPRINT_STATUS_COLORS: Record<string, string> = {
  PLANNING: "#f59e0b",
  ACTIVE: "#10b981",
  COMPLETED: "#64748b",
};

const TASK_STATUS_COLORS: Record<string, { color: string; label: string; icon: any }> = {
  DONE: { color: "#10b981", label: "Done", icon: CheckCircle2 },
  IN_PROGRESS: { color: "#f59e0b", label: "Working", icon: Clock },
  IN_REVIEW: { color: "#a855f7", label: "Review", icon: AlertCircle },
  TODO: { color: "#64748b", label: "Not Started", icon: HelpCircle },
};

export function GanttChart({ projectId, sprints: initialSprints = [], projectStartDate, projectEndDate }: GanttChartProps) {
  const [zoomPreset, setZoomPreset] = useState<"5days" | "weekly" | "monthly">("weekly");
  const [dayWidth, setDayWidth] = useState<number>(24); // Pixels per day
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({});
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [taskOverrides, setTaskOverrides] = useState<Record<string, { startOffsetDays: number; durationDays: number }>>({});

  // Active drag state
  const [activeDrag, setActiveDrag] = useState<{
    type: "move-sprint" | "resize-sprint-left" | "resize-sprint-right" | "move-task" | "resize-task-left" | "resize-task-right";
    targetId: string;
    parentSprintId?: string;
    targetName: string;
    startX: number;
    initialStartOffset: number;
    initialDuration: number;
    currentStartOffset: number;
    currentDuration: number;
  } | null>(null);

  const editSprintMutation = useEditSprintDetails(projectId || "");
  const updateTaskMutation = useUpdateTask(projectId || "");

  useEffect(() => {
    setSprints(initialSprints);
    const initialExpanded = initialSprints.reduce((acc, s) => {
      acc[s.id] = s.status === "ACTIVE" || true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSprints(initialExpanded);
  }, [initialSprints]);

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleZoomPreset = (preset: "5days" | "weekly" | "monthly") => {
    setZoomPreset(preset);
    if (preset === "5days") setDayWidth(45);
    else if (preset === "weekly") setDayWidth(24);
    else setDayWidth(12);
  };

  if (!sprints || sprints.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-slate-500">
        <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No sprints available to render Gantt timeline.
      </div>
    );
  }

  // Calculate global min and max dates
  const minTime = projectStartDate
    ? new Date(projectStartDate).getTime()
    : Math.min(...sprints.map((s) => new Date(s.startDate).getTime()));
  const maxTime = projectEndDate
    ? new Date(projectEndDate).getTime()
    : Math.max(...sprints.map((s) => new Date(s.endDate).getTime()));

  const start = new Date(minTime);
  const end = new Date(maxTime);

  // Extend start & end with buffer padding
  start.setDate(start.getDate() - 4);
  end.setDate(end.getDate() + 10);

  const totalDays = Math.max(14, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalTimelineWidthPx = totalDays * dayWidth;

  const today = new Date();
  const todayOffsetDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const todayLeftPx = todayOffsetDays * dayWidth;
  const isTodayVisible = todayLeftPx >= 0 && todayLeftPx <= totalTimelineWidthPx;

  // Generate Non-Overlapping Date Ticks based on dayWidth pixel spacing
  const minTickGapPx = 70; // Minimum spacing between date labels
  const daysPerTick = Math.max(1, Math.ceil(minTickGapPx / dayWidth));

  const ticks: { date: Date; leftPx: number; isToday: boolean; label: string }[] = [];
  for (let i = 0; i < totalDays; i += daysPerTick) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    ticks.push({
      date: d,
      leftPx: i * dayWidth,
      isToday: today.toDateString() === d.toDateString(),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  const offsetToDateString = (offsetDays: number) => {
    const d = new Date(start.getTime() + Math.round(offsetDays) * 86400000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper to compute FIXED task start offset & duration
  const getTaskInitialBounds = (task: Task, sprintStartOffset: number, tIdx: number) => {
    let taskStartOffset: number;
    if (task.startDate) {
      taskStartOffset = (new Date(task.startDate).getTime() - start.getTime()) / 86400000;
    } else {
      taskStartOffset = sprintStartOffset + tIdx * 2;
    }

    let taskDuration: number;
    if (task.startDate && task.dueDate) {
      const sMs = new Date(task.startDate).getTime();
      const dMs = new Date(task.dueDate).getTime();
      taskDuration = Math.max(1, Math.ceil((dMs - sMs) / 86400000));
    } else {
      taskDuration = Math.max(2, task.storyPoints ? Math.min(task.storyPoints, 7) : 4);
    }

    return { taskStartOffset, taskDuration };
  };

  // Pointer Down Trigger
  const startDragging = (
    e: React.PointerEvent,
    type: "move-sprint" | "resize-sprint-left" | "resize-sprint-right" | "move-task" | "resize-task-left" | "resize-task-right",
    targetId: string,
    targetName: string,
    initialStartOffset: number,
    initialDuration: number,
    parentSprintId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag({
      type,
      targetId,
      parentSprintId,
      targetName,
      startX: e.clientX,
      initialStartOffset,
      initialDuration,
      currentStartOffset: initialStartOffset,
      currentDuration: initialDuration,
    });
  };

  // Global Window Pointer Move & Pointer Up Effects
  useEffect(() => {
    if (!activeDrag) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - activeDrag.startX;
      const deltaDays = deltaX / dayWidth;

      let newStartOffset = activeDrag.initialStartOffset;
      let newDuration = activeDrag.initialDuration;

      // Handle Sprint Resizing / Moving
      if (activeDrag.type.includes("sprint")) {
        if (activeDrag.type === "move-sprint") {
          newStartOffset = Math.max(0, activeDrag.initialStartOffset + deltaDays);
        } else if (activeDrag.type === "resize-sprint-left") {
          newStartOffset = Math.max(0, activeDrag.initialStartOffset + deltaDays);
          newDuration = Math.max(1, activeDrag.initialDuration - deltaDays);
        } else if (activeDrag.type === "resize-sprint-right") {
          newDuration = Math.max(1, activeDrag.initialDuration + deltaDays);
        }

        setSprints((prevSprints) =>
          prevSprints.map((s) => {
            if (s.id !== activeDrag.targetId) return s;
            const sDate = new Date(start.getTime() + Math.round(newStartOffset) * 86400000);
            const eDate = new Date(sDate.getTime() + Math.round(newDuration) * 86400000);
            return { ...s, startDate: sDate.toISOString(), endDate: eDate.toISOString() };
          })
        );
      } else if (activeDrag.type.includes("task")) {
        // Task dragging & resizing - Only task explicitly being dragged changes!
        if (activeDrag.type === "move-task") {
          newStartOffset = Math.max(0, activeDrag.initialStartOffset + deltaDays);
        } else if (activeDrag.type === "resize-task-right") {
          newDuration = Math.max(1, activeDrag.initialDuration + deltaDays);
        } else if (activeDrag.type === "resize-task-left") {
          newStartOffset = Math.max(0, activeDrag.initialStartOffset + deltaDays);
          newDuration = Math.max(1, activeDrag.initialDuration - deltaDays);
        }

        setTaskOverrides((prev) => ({
          ...prev,
          [activeDrag.targetId]: {
            startOffsetDays: newStartOffset,
            durationDays: newDuration,
          },
        }));

        // Rule: Expanding task past Sprint automatically expands Sprint
        if (activeDrag.parentSprintId) {
          const taskEndOffset = newStartOffset + newDuration;

          setSprints((prevSprints) =>
            prevSprints.map((s) => {
              if (s.id !== activeDrag.parentSprintId) return s;
              let sDate = new Date(s.startDate);
              let eDate = new Date(s.endDate);

              const sprintStartOffset = (sDate.getTime() - start.getTime()) / 86400000;
              const sprintEndOffset = (eDate.getTime() - start.getTime()) / 86400000;

              let updated = false;

              if (newStartOffset < sprintStartOffset) {
                sDate = new Date(start.getTime() + Math.round(newStartOffset) * 86400000);
                updated = true;
              }
              if (taskEndOffset > sprintEndOffset) {
                eDate = new Date(start.getTime() + Math.round(taskEndOffset) * 86400000);
                updated = true;
              }

              return updated ? { ...s, startDate: sDate.toISOString(), endDate: eDate.toISOString() } : s;
            })
          );
        }
      }

      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              currentStartOffset: newStartOffset,
              currentDuration: newDuration,
            }
          : null
      );
    };

    const handleWindowPointerUp = async () => {
      if (activeDrag && projectId) {
        if (activeDrag.type.includes("sprint")) {
          const sprint = sprints.find((s) => s.id === activeDrag.targetId);
          if (sprint) {
            try {
              await editSprintMutation.mutateAsync({
                sprintId: sprint.id,
                data: {
                  startDate: new Date(sprint.startDate).toISOString(),
                  endDate: new Date(sprint.endDate).toISOString(),
                },
              });
            } catch (err) {
              console.error("Auto-save sprint error:", err);
            }
          }
        } else if (activeDrag.type.includes("task")) {
          const override = taskOverrides[activeDrag.targetId];
          if (override) {
            const taskStartDate = new Date(start.getTime() + Math.round(override.startOffsetDays) * 86400000).toISOString();
            const taskDueDate = new Date(start.getTime() + Math.round(override.startOffsetDays + override.durationDays) * 86400000).toISOString();

            try {
              await updateTaskMutation.mutateAsync({
                taskId: activeDrag.targetId,
                payload: { startDate: taskStartDate, dueDate: taskDueDate },
              });
            } catch (err) {
              console.error("Auto-save task error:", err);
            }
          }
        }
      }
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [activeDrag, dayWidth, start, sprints, taskOverrides, projectId]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 select-none">
      {/* Header controls & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sprint & Task Interactive Gantt View</h3>
            <p className="text-xs text-slate-500">
              Tasks maintain fixed dates when Sprint resizes · Master synchronized timeline grid
            </p>
          </div>
        </div>

        {/* Legend, Zoom Presets & Direct Zoom Slider */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="hidden lg:flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Active / Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Planning / Working</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              onClick={() => handleZoomPreset("5days")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoomPreset === "5days" ? "bg-white shadow-sm text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              5 Days
            </button>
            <button
              onClick={() => handleZoomPreset("weekly")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoomPreset === "weekly" ? "bg-white shadow-sm text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleZoomPreset("monthly")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoomPreset === "monthly" ? "bg-white shadow-sm text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Interactive Zoom Slider & +/- Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setDayWidth((w) => Math.max(10, w - 5))}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={10}
              max={60}
              value={dayWidth}
              onChange={(e) => setDayWidth(Number(e.target.value))}
              className="w-16 h-1.5 accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer"
              title="Adjust Timeline Scale"
            />
            <button
              onClick={() => setDayWidth((w) => Math.min(60, w + 5))}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Floating Drag Tooltip Banner */}
      {activeDrag && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center justify-between animate-fadeIn">
          <span className="truncate">Editing {activeDrag.targetName}</span>
          <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">
            {offsetToDateString(activeDrag.currentStartOffset)} – {offsetToDateString(activeDrag.currentStartOffset + activeDrag.currentDuration)} ({Math.round(activeDrag.currentDuration)} days)
          </span>
        </div>
      )}

      {/* SINGLE MASTER SCROLL CONTAINER FOR ENTIRE GANTT CHART */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-2xs bg-white">
        <div style={{ width: `${288 + totalTimelineWidthPx}px` }} className="min-w-full">
          {/* Synchronized Date Header Row */}
          <div className="flex border-b border-slate-200/80 bg-slate-50/90 sticky top-0 z-20">
            {/* Sticky Left Column Header */}
            <div className="w-72 pr-3 pl-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-500 shrink-0 sticky left-0 z-30 bg-slate-50 border-r border-slate-200/80 shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
              Sprint Group / Tasks
            </div>

            {/* Date Header Ticks */}
            <div className="relative h-8 flex-1 pl-3">
              {ticks.map((t, idx) => (
                <div
                  key={idx}
                  className={`absolute text-[11px] font-semibold whitespace-nowrap top-2 ${
                    t.leftPx < 20 ? "translate-x-1" : "-translate-x-1/2"
                  } ${t.isToday ? "text-emerald-600 font-extrabold" : "text-slate-500"}`}
                  style={{ left: `${t.leftPx}px` }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Rows Area with Background Vertical Grid Guidelines */}
          <div className="divide-y divide-slate-100 relative">
            {/* Vertical Guideline Overlays */}
            <div className="absolute inset-0 pointer-events-none left-72">
              {ticks.map((t, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-r border-slate-100/80"
                  style={{ left: `${t.leftPx}px` }}
                />
              ))}
            </div>

            {sprints.map((sprint) => {
              const sprintStart = new Date(sprint.startDate);
              const sprintEnd = new Date(sprint.endDate);

              const startOffsetDays = (sprintStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const durationDays = Math.max(1, (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));

              const barLeftPx = Math.max(0, startOffsetDays * dayWidth);
              const barWidthPx = Math.max(30, durationDays * dayWidth);

              const sprintTasks = sprint.tasks || [];
              const doneTasks = sprintTasks.filter((t) => t.status === "DONE").length;
              const progressRatio = sprintTasks.length > 0 ? doneTasks / sprintTasks.length : 0;
              const progressPercent = Math.round(progressRatio * 100);

              const barColor = sprint.color || SPRINT_STATUS_COLORS[sprint.status] || "#10b981";
              const isExpanded = expandedSprints[sprint.id];
              const isDraggingThisSprint = activeDrag?.targetId === sprint.id;

              return (
                <div key={sprint.id} className="space-y-0 relative z-10">
                  {/* Sprint Header Row */}
                  <div className="flex items-center group hover:bg-slate-50/80 transition-colors bg-slate-50/30 border-b border-slate-200/50">
                    {/* Sticky Left Sprint Info */}
                    <div className="w-72 pr-3 pl-2 py-2 flex items-center gap-2 shrink-0 sticky left-0 z-20 bg-slate-50 border-r border-slate-200/80 shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
                      <button
                        onClick={() => toggleExpand(sprint.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: barColor }}
                      />
                      <div className="truncate flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">{sprint.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {sprintTasks.length} tasks · {progressPercent}% done
                        </p>
                      </div>
                    </div>

                    {/* Single Unified Timeline Bar Area */}
                    <div className="relative h-10 flex-1 pl-3">
                      {/* Today Vertical Line inside Sprint row */}
                      {isTodayVisible && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/30 pointer-events-none z-0"
                          style={{ left: `${todayLeftPx}px` }}
                        />
                      )}

                      <div
                        onPointerDown={(e) => startDragging(e, "move-sprint", sprint.id, sprint.name, startOffsetDays, durationDays)}
                        className={`absolute h-7 top-1.5 rounded-lg shadow-sm transition-all duration-75 flex items-center justify-between px-3 text-white text-xs font-bold cursor-grab active:cursor-grabbing group/bar overflow-hidden z-10 ${
                          isDraggingThisSprint ? "ring-2 ring-emerald-500 shadow-lg scale-[1.01]" : ""
                        }`}
                        style={{
                          left: `${barLeftPx}px`,
                          width: `${barWidthPx}px`,
                          backgroundColor: barColor,
                        }}
                      >
                        {/* Left Resize Handle */}
                        <div
                          onPointerDown={(e) => startDragging(e, "resize-sprint-left", sprint.id, sprint.name, startOffsetDays, durationDays)}
                          className="absolute left-0 top-0 bottom-0 w-3 hover:bg-white/40 cursor-ew-resize rounded-l z-20 flex items-center justify-center opacity-70 group-hover/bar:opacity-100 transition-opacity"
                        >
                          <span className="w-1 h-3.5 bg-white/80 rounded-full" />
                        </div>

                        {/* Progress Fill Overlay */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-black/25 pointer-events-none transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />

                        <span className="relative z-10 truncate drop-shadow-sm flex items-center gap-1">
                          <GripHorizontal className="w-3 h-3 opacity-70 shrink-0" />
                          <span className="truncate">{sprint.name}</span>
                        </span>
                        <span className="relative z-10 text-[10px] bg-white/30 px-1.5 py-0.5 rounded font-extrabold ml-1 shrink-0">
                          {progressPercent}%
                        </span>

                        {/* Right Resize Handle */}
                        <div
                          onPointerDown={(e) => startDragging(e, "resize-sprint-right", sprint.id, sprint.name, startOffsetDays, durationDays)}
                          className="absolute right-0 top-0 bottom-0 w-3 hover:bg-white/40 cursor-ew-resize rounded-r z-20 flex items-center justify-center opacity-70 group-hover/bar:opacity-100 transition-opacity"
                        >
                          <span className="w-1 h-3.5 bg-white/80 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Sub-rows inside Expanded Sprint */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100/60">
                      {sprintTasks.length === 0 && (
                        <div className="text-[11px] text-slate-400 italic py-2 pl-12">
                          No tasks assigned to this sprint yet.
                        </div>
                      )}

                      {sprintTasks.map((task, tIdx) => {
                        const tCfg = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.TODO;
                        const StatusIcon = tCfg.icon;

                        const { taskStartOffset, taskDuration } = getTaskInitialBounds(task, startOffsetDays, tIdx);

                        const override = taskOverrides[task.id];
                        const tStartDays = override ? override.startOffsetDays : taskStartOffset;
                        const tDuration = override ? override.durationDays : taskDuration;

                        const taskLeftPx = Math.max(0, tStartDays * dayWidth);
                        const taskWidthPx = Math.max(20, tDuration * dayWidth);
                        const isDraggingThisTask = activeDrag?.targetId === task.id;

                        return (
                          <div
                            key={task.id}
                            className="flex items-center hover:bg-slate-50/60 transition-colors"
                          >
                            {/* Sticky Left Task Title Column */}
                            <div className="w-72 pr-3 pl-8 py-2 flex items-center gap-2 shrink-0 sticky left-0 z-20 bg-white border-r border-slate-200/80 shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
                              <StatusIcon className="w-3.5 h-3.5 shrink-0" style={{ color: tCfg.color }} />
                              <span className="font-semibold text-slate-700 text-xs truncate flex-1" title={task.title}>
                                {task.title}
                              </span>
                              {task.storyPoints ? (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                                  {task.storyPoints}pt
                                </span>
                              ) : null}
                            </div>

                            {/* Single Unified Task Timeline Area */}
                            <div className="relative h-8 flex-1 pl-3">
                              <div
                                onPointerDown={(e) => startDragging(e, "move-task", task.id, task.title, tStartDays, tDuration, sprint.id)}
                                className={`absolute h-5 top-1.5 rounded shadow-2xs transition-all flex items-center justify-between px-2 text-white text-[10px] font-bold cursor-grab active:cursor-grabbing group/tbar z-10 ${
                                  isDraggingThisTask ? "ring-2 ring-emerald-500 shadow-md scale-[1.02]" : ""
                                }`}
                                style={{
                                  left: `${taskLeftPx}px`,
                                  width: `${taskWidthPx}px`,
                                  backgroundColor: tCfg.color,
                                }}
                                title={`${task.title} (${tCfg.label}) — Independent task timeline`}
                              >
                                {/* Left Task Resize Handle */}
                                <div
                                  onPointerDown={(e) => startDragging(e, "resize-task-left", task.id, task.title, tStartDays, tDuration, sprint.id)}
                                  className="absolute left-0 top-0 bottom-0 w-2.5 hover:bg-white/40 cursor-ew-resize rounded-l z-20 opacity-70 group-hover/tbar:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <span className="w-0.5 h-2.5 bg-white/80 rounded-full" />
                                </div>

                                <span className="truncate px-1">{task.title}</span>

                                {/* Right Task Resize Handle */}
                                <div
                                  onPointerDown={(e) => startDragging(e, "resize-task-right", task.id, task.title, tStartDays, tDuration, sprint.id)}
                                  className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-white/40 cursor-ew-resize rounded-r z-20 opacity-70 group-hover/tbar:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <span className="w-0.5 h-2.5 bg-white/80 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
