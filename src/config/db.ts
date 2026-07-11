import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production';

// Reuse a single connection pool. Tuned so we don't exhaust DB connections
// under load and idle connections are reclaimed.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  maxUses: 10_000,
  allowExitOnIdle: true,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  // `query` logging is very verbose (every query) — only in development.
  log: isProd ? ['error'] : ['query', 'error'],
});

export default prisma;