'use client';

import { useState } from 'react';
import {
  LayoutGrid,
  List,
  Zap,
  Users,
  GanttChartSquare,
  Network,
} from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { Backlog } from './Backlog';
import { SprintsList } from './SprintsList';
import { MembersList } from './MembersList';
import { GanttChart } from './GanttChart';
import { WBSChart } from './WBSChart';

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

const TABS = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'backlog', label: 'Backlog', icon: List },
  { id: 'sprints', label: 'Sprints', icon: Zap },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'gantt', label: 'Gantt', icon: GanttChartSquare },
  { id: 'wbs', label: 'WBS', icon: Network },
];

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div>
      {/* Tab bar */}
      <div className="bg-white border border-stone-200 rounded-xl mb-4 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-stone-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'board' && (
          <KanbanBoard projectId={project.id} tasks={project.tasks} />
        )}
        {activeTab === 'backlog' && (
          <Backlog
            projectId={project.id}
            tasks={project.tasks}
            sprints={project.sprints}
          />
        )}
        {activeTab === 'sprints' && (
          <SprintsList projectId={project.id} sprints={project.sprints} />
        )}
        {activeTab === 'members' && (
          <MembersList projectId={project.id} members={project.members} />
        )}
        {activeTab === 'gantt' && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">Gantt Chart</h3>
            <GanttChart sprints={project.sprints} />
          </div>
        )}
        {activeTab === 'wbs' && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">Work Breakdown Structure</h3>
            <WBSChart tasks={project.tasks} />
          </div>
        )}
      </div>
    </div>
  );
}
