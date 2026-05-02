// Re-export Prisma enums and types for use in both API and web
export type {
  User,
  Project,
  ProjectMember,
  Sprint,
  Task,
  Notification,
  ActivityLog,
} from '@prisma/client';

export { SystemRole, ProjectRole, SprintStatus, TaskStatus, Priority } from '@prisma/client';

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Extended types with relations
export interface ProjectWithDetails {
  id: string;
  name: string;
  description: string | null;
  supervisorId: string | null;
  activeSprintId: string | null;
  createdAt: Date;
  members: Array<{
    id: string;
    role: string;
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  }>;
  _count: {
    tasks: number;
    sprints: number;
  };
}

export interface SprintWithTasks {
  id: string;
  name: string;
  goal: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  tasks: TaskWithAssignee[];
}

export interface TaskWithAssignee {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  storyPoints: number | null;
  position: number;
  sprintId: string | null;
  assignee: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
  creator: Pick<User, 'id' | 'name'>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}
