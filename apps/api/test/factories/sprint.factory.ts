import { SprintStatus } from '@apms/database/generated/client';

export const createSprint = (overrides: any = {}) => ({
  id: 'sprint-' + Math.random().toString(36).substr(2, 9),
  name: 'Sprint 1',
  projectId: 'project-1',
  status: SprintStatus.PLANNED,
  goal: 'Complete features',
  startDate: new Date(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
