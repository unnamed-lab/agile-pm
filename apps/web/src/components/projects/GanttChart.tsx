'use client';

import { useState } from 'react';
import { Calendar, Zap, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  storyPoints?: number;
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  tasks?: Task[];
}

interface GanttChartProps {
  sprints: Sprint[];
  projectStartDate?: string | Date;
  projectEndDate?: string | Date;
}

const SPRINT_STATUS_COLORS: Record<string, string> = {
  PLANNING: '#fdab3d',
  ACTIVE: '#00c875',
  COMPLETED: '#94a3b8',
};

const TASK_STATUS_COLORS: Record<string, { color: string; label: string; icon: any }> = {
  DONE: { color: '#00c875', label: 'Done', icon: CheckCircle2 },
  IN_PROGRESS: { color: '#fdab3d', label: 'Working', icon: Clock },
  IN_REVIEW: { color: '#a25ddc', label: 'Review', icon: AlertCircle },
  TODO: { color: '#94a3b8', label: 'Not Started', icon: HelpCircle },
};

export function GanttChart({ sprints, projectStartDate, projectEndDate }: GanttChartProps) {
  const [zoom, setZoom] = useState<'days' | 'weeks'>('weeks');
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({
    // Expand active sprints by default
    ...(sprints.reduce((acc, s) => {
      acc[s.id] = s.status === 'ACTIVE' || true;
      return acc;
    }, {} as Record<string, boolean>)),
  });

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  if (!sprints || sprints.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-slate-500">
        <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No sprints available to render Gantt timeline.
      </div>
    );
  }

  // Calculate global start and end timeline bounds
  const minTime = projectStartDate
    ? new Date(projectStartDate).getTime()
    : Math.min(...sprints.map(s => new Date(s.startDate).getTime()));
  const maxTime = projectEndDate
    ? new Date(projectEndDate).getTime()
    : Math.max(...sprints.map(s => new Date(s.endDate).getTime()));

  const start = new Date(minTime);
  const end = new Date(maxTime);

  // Extend by buffer days
  start.setDate(start.getDate() - 2);
  end.setDate(end.getDate() + 5);

  const totalDays = Math.max(14, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const today = new Date();
  const todayOffsetDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const todayPercent = (todayOffsetDays / totalDays) * 100;
  const isTodayVisible = todayPercent >= 0 && todayPercent <= 100;

  // Generate clean, spaced date ticks (every 5 or 7 days)
  const ticks: { date: Date; offsetPercent: number; isToday: boolean }[] = [];
  const step = zoom === 'days' ? 5 : 7;
  for (let i = 0; i < totalDays; i += step) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    ticks.push({
      date: d,
      offsetPercent: (i / totalDays) * 100,
      isToday: today.toDateString() === d.toDateString(),
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sprint & Task Interactive Gantt View</h3>
            <p className="text-xs text-slate-500">
              {sprints.length} Sprints · {sprints.reduce((acc, s) => acc + (s.tasks?.length || 0), 0)} Total Tasks
            </p>
          </div>
        </div>

        {/* Legend & Zoom Controls */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#00c875]" />
              <span>Active / Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#fdab3d]" />
              <span>Planning / Working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#a25ddc]" />
              <span>In Review</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setZoom('days')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoom === 'days' ? 'bg-white shadow-sm text-slate-800 font-bold' : 'text-slate-500'
              }`}
            >
              5 Days
            </button>
            <button
              onClick={() => setZoom('weeks')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoom === 'weeks' ? 'bg-white shadow-sm text-slate-800 font-bold' : 'text-slate-500'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] relative">
          {/* Timeline Header Row */}
          <div className="flex border-b border-slate-200 pb-2 mb-3 items-center">
            <div className="w-72 font-bold text-xs uppercase tracking-wider text-slate-500 pl-2 shrink-0">
              Sprint Group / Tasks
            </div>
            <div className="flex-1 relative h-6">
              {ticks.map((t, idx) => (
                <div
                  key={idx}
                  className={`absolute text-[11px] font-semibold whitespace-nowrap -translate-x-1/2 ${
                    t.isToday ? 'text-blue-600 font-extrabold' : 'text-slate-500'
                  }`}
                  style={{ left: `${t.offsetPercent}%` }}
                >
                  {t.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Today Indicator Line */}
          {isTodayVisible && (
            <div
              className="absolute top-8 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
              style={{ left: `calc(18rem + ${(todayPercent * (100 - 28)) / 100}%)` }}
            >
              <div className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full -translate-x-1/2 shadow-md">
                TODAY
              </div>
            </div>
          )}

          {/* Sprint Rows & Tasks */}
          <div className="space-y-4 pt-1">
            {sprints.map(sprint => {
              const sprintStart = new Date(sprint.startDate);
              const sprintEnd = new Date(sprint.endDate);

              const startOffsetDays = (sprintStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const durationDays = Math.max(1, (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));

              const leftPercent = Math.max(0, (startOffsetDays / totalDays) * 100);
              const widthPercent = Math.min(100 - leftPercent, (durationDays / totalDays) * 100);

              const sprintTasks = sprint.tasks || [];
              const doneTasks = sprintTasks.filter(t => t.status === 'DONE').length;
              const progressRatio = sprintTasks.length > 0 ? doneTasks / sprintTasks.length : 0;
              const progressPercent = Math.round(progressRatio * 100);

              const barColor = sprint.color || SPRINT_STATUS_COLORS[sprint.status] || '#00c875';
              const isExpanded = expandedSprints[sprint.id];

              return (
                <div key={sprint.id} className="space-y-1">
                  {/* Main Sprint Header Row */}
                  <div className="flex items-center group hover:bg-slate-50 rounded-xl p-1.5 transition-colors bg-slate-50/50 border border-slate-100">
                    {/* Left Sprint Info */}
                    <div className="w-72 pr-3 pl-1 flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleExpand(sprint.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: barColor }}
                      />
                      <div className="truncate flex-1">
                        <p className="font-bold text-xs text-slate-800 truncate">{sprint.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {sprintTasks.length} tasks · {progressPercent}% done
                        </p>
                      </div>
                    </div>

                    {/* Right Sprint Timeline Bar Area */}
                    <div className="flex-1 relative h-9 bg-slate-200/50 rounded-lg flex items-center px-1">
                      <div
                        onClick={() => toggleExpand(sprint.id)}
                        className="absolute h-7 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-between px-3 text-white text-xs font-bold hover:brightness-105 cursor-pointer overflow-hidden"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.max(8, widthPercent)}%`,
                          backgroundColor: barColor,
                        }}
                        title={`${sprint.name} (${sprint.status}) — ${progressPercent}% Completed`}
                      >
                        {/* Progress Fill */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-black/25 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />

                        <span className="relative z-10 truncate drop-shadow-sm">{sprint.name}</span>
                        <span className="relative z-10 text-[10px] bg-white/30 px-1.5 py-0.5 rounded font-extrabold ml-1 shrink-0">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task Sub-rows inside Expanded Sprint */}
                  {isExpanded && (
                    <div className="pl-6 space-y-1 border-l-2 border-slate-200 ml-3 pt-1">
                      {sprintTasks.length === 0 && (
                        <div className="text-[11px] text-slate-400 italic py-1 pl-4">
                          No tasks assigned to this sprint yet.
                        </div>
                      )}

                      {sprintTasks.map((task, tIdx) => {
                        const tCfg = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.TODO;
                        const StatusIcon = tCfg.icon;

                        // Stagger task bars evenly across sprint timeline
                        const taskStep = durationDays / Math.max(1, sprintTasks.length);
                        const taskStartDays = startOffsetDays + tIdx * (taskStep * 0.4);
                        const taskDuration = Math.max(2, taskStep * 0.8);

                        const taskLeft = Math.max(0, (taskStartDays / totalDays) * 100);
                        const taskWidth = Math.min(100 - taskLeft, (taskDuration / totalDays) * 100);

                        return (
                          <div
                            key={task.id}
                            className="flex items-center hover:bg-slate-50/80 rounded-lg p-1 transition-colors text-xs"
                          >
                            {/* Left Task Title & Status */}
                            <div className="w-[260px] pr-3 flex items-center gap-2 shrink-0">
                              <StatusIcon className="w-3.5 h-3.5 shrink-0" style={{ color: tCfg.color }} />
                              <span className="font-semibold text-slate-700 text-xs truncate flex-1" title={task.title}>
                                {task.title}
                              </span>
                              {task.storyPoints ? (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  {task.storyPoints}pt
                                </span>
                              ) : null}
                            </div>

                            {/* Right Task Bar Area */}
                            <div className="flex-1 relative h-6 bg-slate-100/50 rounded flex items-center px-1">
                              <div
                                className="absolute h-4 rounded shadow-2xs transition-all flex items-center px-2 text-white text-[10px] font-bold truncate"
                                style={{
                                  left: `${taskLeft}%`,
                                  width: `${Math.max(4, taskWidth)}%`,
                                  backgroundColor: tCfg.color,
                                }}
                                title={`${task.title} (${tCfg.label})`}
                              >
                                <span className="truncate">{task.title}</span>
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
