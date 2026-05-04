'use client';

import { useEffect, useState } from 'react';

interface ActivityLog {
  id: string;
  action: string;
  metadata?: any;
  createdAt: string;
  user?: { id: string; name: string; avatarUrl?: string | null };
}

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
}

export function ActivityFeed({ projectId, limit = 50 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = projectId
      ? `/api/activity/project/${projectId}?limit=${limit}`
      : `/api/activity/user?limit=${limit}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId, limit]);

  function getActionText(action: string, metadata: any) {
    switch (action) {
      case 'PROJECT_CREATED':
        return `created project "${metadata?.projectName || 'Unknown'}"`;
      case 'SPRINT_CREATED':
        return `created sprint "${metadata?.sprintName || 'Unknown'}"`;
      case 'SPRINT_STARTED':
        return `started sprint "${metadata?.sprintName || 'Unknown'}"`;
      case 'SPRINT_COMPLETED':
        return `completed sprint "${metadata?.sprintName || 'Unknown'}"`;
      case 'TASK_CREATED':
        return `created task "${metadata?.taskTitle || 'Unknown'}"`;
      case 'TASK_UPDATED':
        return `updated task "${metadata?.taskTitle || 'Unknown'}"`;
      case 'TASK_MOVED':
        return `moved task "${metadata?.taskTitle || 'Unknown'}"`;
      case 'TASK_DELETED':
        return `deleted task "${metadata?.taskTitle || 'Unknown'}"`;
      default:
        return `performed ${action.toLowerCase().replace(/_/g, ' ')}`;
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No activity yet</p>
      ) : (
        activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
              {activity.user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user?.name || 'Unknown'}</span>{' '}
                {getActionText(activity.action, activity.metadata)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
