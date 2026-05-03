import { PrismaService } from '../../src/prisma/prisma.service';
import { createUser } from './user.factory';

export const createProject = async (
  prisma: PrismaService,
  overrides?: {
    name?: string;
    description?: string;
    supervisorId?: string;
  }
) => {
  const user = await createUser(prisma);
  
  return prisma.project.create({
    data: {
      name: overrides?.name || 'Test Project',
      description: overrides?.description || 'Test Description',
      supervisorId: overrides?.supervisorId,
      members: {
        create: { userId: user.id, role: 'SCRUM_MASTER' },
      },
    },
  });
};
