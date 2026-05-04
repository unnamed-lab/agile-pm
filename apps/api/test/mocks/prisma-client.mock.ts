export const PrismaClient = jest.fn().mockImplementation(() => ({}));
export const TaskStatus = { TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', DONE: 'DONE', BLOCKED: 'BLOCKED' };
export const SprintStatus = { PLANNED: 'PLANNED', ACTIVE: 'ACTIVE', COMPLETED: 'COMPLETED' };
export const Priority = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'URGENT' };
export const SystemRole = { ADMIN: 'ADMIN', DEVELOPER: 'DEVELOPER' };
export const ProjectRole = { SCRUM_MASTER: 'SCRUM_MASTER', DEVELOPER: 'DEVELOPER', VIEWER: 'VIEWER' };
export const Prisma = { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} };
