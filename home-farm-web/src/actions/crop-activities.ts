"use server";

import { db } from "@/db";
import { harvestings, plantings, sprayings, wastes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCropActivities(cropId: number) {
  const [plantingsRows, harvestingsRows, sprayingsRows, wastesRows] = await Promise.all([
    db.select().from(plantings).where(eq(plantings.cropId, cropId)).orderBy(plantings.date),
    db.select().from(harvestings).where(eq(harvestings.cropId, cropId)).orderBy(harvestings.date),
    db.select().from(sprayings).where(eq(sprayings.cropId, cropId)).orderBy(sprayings.date),
    db.select().from(wastes).where(eq(wastes.cropId, cropId)).orderBy(wastes.date),
  ]);

  return {
    plantings: plantingsRows,
    harvestings: harvestingsRows,
    sprayings: sprayingsRows,
    wastes: wastesRows,
  };
}