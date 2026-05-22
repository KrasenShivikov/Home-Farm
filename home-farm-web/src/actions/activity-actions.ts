"use server";

import { db } from "@/db";
import { harvestings, sprayings, wastes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPE_VALUES, type ActivityType } from "@/lib/activity-types";

export type ActivityActionState = {
  error?: string;
  success?: string;
};

type ActivityValues = {
  id: number | null;
  cropId: number;
  date: string;
  quantity: string;
  type: ActivityType;
  description: string | null;
};

function getActivityValues(formData: FormData) {
  const idValue = formData.get("id");
  const cropIdValue = formData.get("cropId");
  const date = String(formData.get("date") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const typeValue = String(formData.get("type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const id = idValue ? Number(idValue) : null;
  const cropId = Number(cropIdValue);

  if (!Number.isInteger(cropId) || cropId <= 0) {
    return { error: "Невалидна култура." } as const;
  }

  if (!date || !quantity) {
    return { error: "Датата и количеството са задължителни." } as const;
  }

  const type = (ACTIVITY_TYPE_VALUES as readonly string[]).includes(typeValue)
    ? (typeValue as ActivityType)
    : ACTIVITY_TYPE_VALUES[0];

  return {
    id,
    cropId,
    date,
    quantity,
    type,
    description: description || null,
  } as const;
}

async function createActivity(
  table: typeof harvestings | typeof sprayings | typeof wastes,
  successMessage: string,
  formData: FormData
): Promise<ActivityActionState> {
  const values = getActivityValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  await db.insert(table).values({
    cropId: values.cropId,
    date: values.date,
    quantity: values.quantity,
    type: values.type,
    description: values.description,
    createdFrom: "manual",
  });

  revalidatePath(`/admin/crops/${values.cropId}`);

  return { success: successMessage };
}

async function updateActivity(
  table: typeof harvestings | typeof sprayings | typeof wastes,
  successMessage: string,
  formData: FormData
): Promise<ActivityActionState> {
  const values = getActivityValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  if (!values.id || !Number.isInteger(values.id) || values.id <= 0) {
    return { error: "Невалиден запис." };
  }

  await db
    .update(table)
    .set({
      date: values.date,
      quantity: values.quantity,
      type: values.type,
      description: values.description,
    })
    .where(eq(table.id, values.id));

  revalidatePath(`/admin/crops/${values.cropId}`);

  return { success: successMessage };
}

async function deleteActivity(
  table: typeof harvestings | typeof sprayings | typeof wastes,
  successMessage: string,
  formData: FormData
): Promise<ActivityActionState> {
  const cropId = Number(formData.get("cropId"));
  const id = Number(formData.get("id"));

  if (!Number.isInteger(cropId) || cropId <= 0 || !Number.isInteger(id) || id <= 0) {
    return { error: "Невалидни данни." };
  }

  await db.delete(table).where(eq(table.id, id));
  revalidatePath(`/admin/crops/${cropId}`);

  return { success: successMessage };
}

export async function createHarvestingAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return createActivity(harvestings, "Реколтата е добавена.", formData);
}

export async function updateHarvestingAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return updateActivity(harvestings, "Реколтата е обновена.", formData);
}

export async function deleteHarvestingAction(
  formData: FormData
): Promise<ActivityActionState> {
  return deleteActivity(harvestings, "Реколтата е изтрита.", formData);
}

export async function createSprayingAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return createActivity(sprayings, "Пръскането е добавено.", formData);
}

export async function updateSprayingAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return updateActivity(sprayings, "Пръскането е обновено.", formData);
}

export async function deleteSprayingAction(
  formData: FormData
): Promise<ActivityActionState> {
  return deleteActivity(sprayings, "Пръскането е изтрито.", formData);
}

export async function createWasteAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return createActivity(wastes, "Загубата е добавена.", formData);
}

export async function updateWasteAction(
  _prevState: ActivityActionState | null,
  formData: FormData
): Promise<ActivityActionState> {
  return updateActivity(wastes, "Загубата е обновена.", formData);
}

export async function deleteWasteAction(
  formData: FormData
): Promise<ActivityActionState> {
  return deleteActivity(wastes, "Загубата е изтрита.", formData);
}