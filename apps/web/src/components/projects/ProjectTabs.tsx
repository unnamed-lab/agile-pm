'use client';

import { useState } from 'react';
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

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState('board');

  const tabs = [
    { id: 'board', label: 'Board' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'sprints', label: 'Sprints' },
    { id: 'members', label: 'Members' },
    { id: 'gantt', label: 'Gantt' },
    { id: 'wbs', label: 'WBS' },
  ];

  return (
    <div>
      <div className="border-b bg-white px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
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
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Gantt Chart</h3>
            <GanttChart sprints={project.sprints} />
          </div>
        )}
        {activeTab === 'wbs' && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Work Breakdown Structure</h3>
            <WBSChart tasks={project.tasks} />
          </div>
        )}
      </div>
    </div>
  );
}
