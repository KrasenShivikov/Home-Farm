"use server";

import { db } from "@/db";
import { crops } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCropById(cropId: number) {
  const [crop] = await db.select().from(crops).where(eq(crops.id, cropId)).limit(1);

  return crop ?? null;
}