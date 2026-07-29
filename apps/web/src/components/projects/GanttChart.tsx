'use client';

import { useState } from 'react';
import { Calendar, ChevronRight, Clock, ZoomIn, ZoomOut, Zap } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  storyPoints: number;
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

const STATUS_COLORS: Record<string, string> = {
  TODO: '#c4c4c4',
  IN_PROGRESS: '#fdab3d',
  IN_REVIEW: '#a25ddc',
  DONE: '#00c875',
};

const SPRINT_STATUS_COLORS: Record<string, string> = {
  PLANNING: '#fdab3d',
  ACTIVE: '#00c875',
  COMPLETED: '#94a3b8',
};

export function GanttChart({ sprints, projectStartDate, projectEndDate }: GanttChartProps) {
  const [zoom, setZoom] = useState<'days' | 'weeks'>('days');

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

  // Extend by a couple days buffer
  start.setDate(start.getDate() - 1);
  end.setDate(end.getDate() + 3);

  const totalDays = Math.max(7, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const today = new Date();
  const todayOffsetDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const todayPercent = (todayOffsetDays / totalDays) * 100;
  const isTodayVisible = todayPercent >= 0 && todayPercent <= 100;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sprint Timeline & Gantt View</h3>
            <p className="text-xs text-slate-500">
              {sprints.length} Sprints · {totalDays} Days Span
            </p>
          </div>
        </div>

        {/* Legend & Zoom */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#00c875]" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#fdab3d]" />
              <span>Planning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#94a3b8]" />
              <span>Completed</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setZoom('days')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoom === 'days' ? 'bg-white shadow-sm text-slate-800 font-bold' : 'text-slate-500'
              }`}
            >
              Days
            </button>
            <button
              onClick={() => setZoom('weeks')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                zoom === 'weeks' ? 'bg-white shadow-sm text-slate-800 font-bold' : 'text-slate-500'
              }`}
            >
              Weeks
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] relative">
          {/* Timeline Header Row */}
          <div className="flex border-b border-slate-200 pb-2 mb-3">
            <div className="w-64 font-bold text-xs uppercase tracking-wider text-slate-500 pl-2">
              Sprint / Tasks
            </div>
            <div className="flex-1 relative h-7 flex items-center">
              {Array.from({ length: Math.min(totalDays, 45) }, (_, i) => {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                const isToday = today.toDateString() === date.toDateString();

                if (zoom === 'weeks' && date.getDay() !== 1 && i !== 0) return null;

                return (
                  <div
                    key={i}
                    className={`absolute text-[11px] font-semibold -translate-x-1/2 ${
                      isToday ? 'text-blue-600 font-extrabold scale-110' : 'text-slate-400'
                    }`}
                    style={{ left: `${(i / totalDays) * 100}%` }}
                  >
                    {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today Indicator Vertical Blue Line */}
          {isTodayVisible && (
            <div
              className="absolute top-8 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
              style={{ left: `calc(16rem + ${(todayPercent * (100 - (16 / 53))) / 100}%)` }}
            >
              <div className="bg-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full -translate-x-1/2 shadow-md">
                TODAY
              </div>
            </div>
          )}

          {/* Sprint Rows */}
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

              const barColor = sprint.color || SPRINT_STATUS_COLORS[sprint.status] || '#00c875';

              return (
                <div key={sprint.id} className="flex items-center group hover:bg-slate-50/60 rounded-xl p-1 transition-colors">
                  {/* Left Metadata Pane */}
                  <div className="w-64 pr-4 pl-2 space-y-0.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: barColor }}
                      />
                      <p className="font-bold text-xs text-slate-800 truncate">{sprint.name}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium pl-4">
                      {new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' – '}
                      {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Right Bar Area */}
                  <div className="flex-1 relative h-10 bg-slate-100/70 rounded-xl flex items-center px-1">
                    {/* Monday Style Timeline Bar Capsule */}
                    <div
                      className="absolute h-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-between px-3 text-white text-xs font-bold hover:brightness-110 cursor-pointer overflow-hidden group/bar"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(4, widthPercent)}%`,
                        backgroundColor: barColor,
                      }}
                      title={`${sprint.name} (${sprint.status})`}
                    >
                      {/* Inner Progress Overlay */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-500"
                        style={{ width: `${progressRatio * 100}%` }}
                      />

                      <span className="relative z-10 truncate drop-shadow-sm">{sprint.name}</span>
                      <span className="relative z-10 text-[10px] bg-white/30 px-1.5 py-0.5 rounded font-extrabold ml-1 shrink-0">
                        {Math.round(progressRatio * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
