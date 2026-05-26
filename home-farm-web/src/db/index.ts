import "server-only";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment");
}

const { Pool } = pg;
const globalForDb = globalThis as typeof globalThis & {
  homeFarmPool?: pg.Pool;
};

const pool =
  globalForDb.homeFarmPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.homeFarmPool = pool;
}

export const db = drizzle(pool, { schema });
