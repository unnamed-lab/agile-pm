import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});

export const prisma =
  globalForPrisma.prisma ?? 
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as Prisma.LogLevel[] : ['error'] as Prisma.LogLevel[],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
export type { Prisma } from '@prisma/client';
export { PrismaClient } from '@prisma/client';
export type { Prisma } from '../generated/client'
