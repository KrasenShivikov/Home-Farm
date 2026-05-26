import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from environment");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
