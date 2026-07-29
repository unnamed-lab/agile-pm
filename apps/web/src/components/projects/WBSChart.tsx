'use client';

import { useState } from 'react';
import { Network, ChevronDown, ChevronRight, User, Layers, CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  storyPoints: number;
  priority: string;
  assignee?: { name: string } | null;
}

interface WBSChartProps {
  tasks: Task[];
  initialGroupBy?: 'status' | 'priority' | 'assignee';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: any }> = {
  DONE: { label: 'Done', bg: 'bg-[#00c875] text-white', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'Working on it', bg: 'bg-[#fdab3d] text-white', icon: Clock },
  IN_REVIEW: { label: 'In Review', bg: 'bg-[#a25ddc] text-white', icon: AlertCircle },
  TODO: { label: 'Not Started', bg: 'bg-[#94a3b8] text-white', icon: HelpCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string }> = {
  HIGH: { label: 'High', bg: 'bg-rose-500 text-white' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500 text-white' },
  LOW: { label: 'Low', bg: 'bg-blue-400 text-white' },
};

export function WBSChart({ tasks = [], initialGroupBy = 'status' }: WBSChartProps) {
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>(initialGroupBy);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <Network className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No tasks available for Work Breakdown Structure.
      </div>
    );
  }

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groups: Record<string, Task[]> = {};
  tasks.forEach(task => {
    let key = 'Unassigned';
    if (groupBy === 'status') key = task.status || 'TODO';
    else if (groupBy === 'priority') key = task.priority || 'MEDIUM';
    else if (groupBy === 'assignee') key = task.assignee?.name || 'Unassigned';

    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  });

  return (
    <div className="space-y-5">
      {/* Grouping Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500 ml-2" />
          <span className="text-xs font-bold text-slate-700">Group WBS By:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['status', 'priority', 'assignee'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setGroupBy(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                groupBy === opt
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* WBS Breakdown Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(groups).map(([groupKey, groupTasks]) => {
          const isCollapsed = collapsedGroups[groupKey];
          const totalPoints = groupTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
          const doneCount = groupTasks.filter(t => t.status === 'DONE').length;

          return (
            <div
              key={groupKey}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Branch Header */}
              <div
                onClick={() => toggleGroup(groupKey)}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <button className="text-slate-400">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <h4 className="text-sm font-bold text-slate-800">{groupKey}</h4>
                  <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {groupTasks.length} tasks
                  </span>
                </div>

                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {totalPoints} pts total
                </div>
              </div>

              {/* Task Items Grid */}
              {!isCollapsed && (
                <div className="p-3 space-y-2.5">
                  {groupTasks.map(task => {
                    const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                    const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                    const Icon = statusCfg.icon;

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 text-[11px]">
                            {task.assignee && (
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                {task.assignee.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs ${statusCfg.bg}`}>
                            <Icon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityCfg.bg}`}>
                            {priorityCfg.label}
                          </span>
                          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                            {task.storyPoints || 0} pts
                          </span>
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
  );
}
