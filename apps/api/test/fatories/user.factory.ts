import { PrismaService } from '../../src/prisma/prisma.service';
import { SystemRole } from '@apms/database/generated/client';

export const createUser = async (
  prisma: PrismaService,
  overrides?: {
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: SystemRole;
  }
) => {
  return prisma.user.create({
    data: {
      name: overrides?.name || 'Test User',
      email: overrides?.email || `test${Date.now()}@example.com`,
      passwordHash: overrides?.passwordHash || 'hashedpassword',
      role: overrides?.role || SystemRole.STUDENT,
    },
  });
};
