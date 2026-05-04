export const createProject = (overrides: any = {}) => ({
  id: 'project-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Project',
  description: 'Test Description',
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
