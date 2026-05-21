"use server";

import { db } from "@/db";
import { plantings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PlantingActionState = {
  error?: string;
  success?: string;
};

function getPlantingValues(formData: FormData) {
  const idValue = formData.get("id");
  const cropIdValue = formData.get("cropId");
  const date = String(formData.get("date") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const id = idValue ? Number(idValue) : null;
  const cropId = Number(cropIdValue);

  if (!Number.isInteger(cropId) || cropId <= 0) {
    return { error: "Невалидна култура." } as const;
  }

  if (!date || !quantity) {
    return { error: "Датата и количеството са задължителни." } as const;
  }

  return {
    id,
    cropId,
    date,
    quantity,
    description: description || null,
  } as const;
}

export async function createPlantingAction(
  _prevState: PlantingActionState | null,
  formData: FormData
): Promise<PlantingActionState> {
  const values = getPlantingValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  await db.insert(plantings).values({
    cropId: values.cropId,
    date: values.date,
    quantity: values.quantity,
    description: values.description,
    createdFrom: "manual",
  });

  revalidatePath(`/admin/crops/${values.cropId}`);

  return { success: "Посевът е добавен." };
}

export async function updatePlantingAction(
  _prevState: PlantingActionState | null,
  formData: FormData
): Promise<PlantingActionState> {
  const values = getPlantingValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  if (!values.id || !Number.isInteger(values.id) || values.id <= 0) {
    return { error: "Невалиден запис." };
  }

  await db
    .update(plantings)
    .set({
      date: values.date,
      quantity: values.quantity,
      description: values.description,
    })
    .where(eq(plantings.id, values.id));

  revalidatePath(`/admin/crops/${values.cropId}`);

  return { success: "Посевът е обновен." };
}

export async function deletePlantingAction(formData: FormData) {
  const cropId = Number(formData.get("cropId"));
  const id = Number(formData.get("id"));

  if (!Number.isInteger(cropId) || cropId <= 0 || !Number.isInteger(id) || id <= 0) {
    return { error: "Невалидни данни." };
  }

  await db.delete(plantings).where(eq(plantings.id, id));
  revalidatePath(`/admin/crops/${cropId}`);

  return { success: "Посевът е изтрит." };
}