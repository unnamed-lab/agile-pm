export const createUser = (overrides: any = {}) => ({
  id: 'user-' + Math.random().toString(36).substr(2, 9),
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  role: 'DEVELOPER',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createAdminUser = (overrides: any = {}) =>
  createUser({ role: 'ADMIN', ...overrides });
