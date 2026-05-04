import { TaskStatus, Priority } from '@apms/database/generated/client';

export const createTask = (overrides: any = {}) => ({
  id: 'task-' + Math.random().toString(36).substr(2, 9),
  projectId: 'project-1',
  sprintId: null,
  creatorId: 'user-1',
  assigneeId: null,
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.TODO,
  priority: Priority.MEDIUM,
  storyPoints: 0,
  position: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
