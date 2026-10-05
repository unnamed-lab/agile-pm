import 'dotenv/config'
import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import type { Prisma } from './generated/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
const isLocal = !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

if (!isLocal) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? 
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as Prisma.LogLevel[] : ['error'] as Prisma.LogLevel[],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { Prisma } from './generated/client'
export { PrismaClient } from './generated/client'

