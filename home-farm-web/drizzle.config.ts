import path from "path";
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
