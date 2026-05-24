"use server";

import { db } from "@/db";
import { expences, expencesType } from "@/db/schema";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ExpenceActionState = {
  error?: string;
  success?: string;
};

export type ExpenceTypeOption = {
  id: number;
  name: string;
};

export type ExpenceRecord = {
  id: number;
  name: string;
  expencesTypeId: number;
  typeName: string;
  description: string | null;
  date: string;
  value: string | null;
};

export type ExpenceFilters = {
  startDate?: string;
  endDate?: string;
  typeId?: string;
};

type ExpenceValues = {
  id: number | null;
  name: string;
  expencesTypeId: number | null;
  expencesTypeName: string;
  description: string | null;
  date: string;
  value: string;
};

function getExpenceValues(formData: FormData) {
  const idValue = formData.get("id");
  const typeIdValue = formData.get("expencesTypeId");
  const name = String(formData.get("name") ?? "").trim();
  const expencesTypeName = String(formData.get("expencesTypeName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();

  const id = idValue ? Number(idValue) : null;
  const expencesTypeId = typeIdValue ? Number(typeIdValue) : null;
  const numericValue = Number(value);

  if (!name || !date || !value) {
    return { error: "Името, датата и стойността са задължителни." } as const;
  }

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return { error: "Въведете валидна стойност." } as const;
  }

  if (!expencesTypeName && (!expencesTypeId || !Number.isInteger(expencesTypeId) || expencesTypeId <= 0)) {
    return { error: "Изберете тип или въведете нов тип разход." } as const;
  }

  return {
    id,
    name,
    expencesTypeId,
    expencesTypeName,
    description: description || null,
    date,
    value,
  } satisfies ExpenceValues;
}

async function resolveExpenceTypeId(values: ExpenceValues) {
  if (values.expencesTypeName) {
    const [createdType] = await db
      .insert(expencesType)
      .values({ name: values.expencesTypeName })
      .returning({ id: expencesType.id });

    return createdType.id;
  }

  return values.expencesTypeId!;
}

function revalidateExpencePaths() {
  revalidatePath("/admin/expences");
}

export async function getExpenceTypes(): Promise<ExpenceTypeOption[]> {
  return db
    .select({ id: expencesType.id, name: expencesType.name })
    .from(expencesType)
    .orderBy(asc(expencesType.name));
}

export async function getExpences(filters: ExpenceFilters = {}): Promise<ExpenceRecord[]> {
  const conditions = [];

  if (filters.startDate) {
    conditions.push(gte(expences.date, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(expences.date, filters.endDate));
  }

  const typeId = filters.typeId ? Number(filters.typeId) : null;
  if (typeId && Number.isInteger(typeId) && typeId > 0) {
    conditions.push(eq(expences.expencesTypeId, typeId));
  }

  return db
    .select({
      id: expences.id,
      name: expences.name,
      expencesTypeId: expences.expencesTypeId,
      typeName: expencesType.name,
      description: expences.description,
      date: expences.date,
      value: expences.value,
    })
    .from(expences)
    .innerJoin(expencesType, eq(expencesType.id, expences.expencesTypeId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(expences.date), desc(expences.id));
}

export async function createExpenceAction(
  _prevState: ExpenceActionState | null,
  formData: FormData
): Promise<ExpenceActionState> {
  const values = getExpenceValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  const typeId = await resolveExpenceTypeId(values);

  await db.insert(expences).values({
    name: values.name,
    expencesTypeId: typeId,
    description: values.description,
    date: values.date,
    value: values.value,
  });

  revalidateExpencePaths();

  return { success: "Разходът е добавен." };
}

export async function updateExpenceAction(
  _prevState: ExpenceActionState | null,
  formData: FormData
): Promise<ExpenceActionState> {
  const values = getExpenceValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  if (!values.id || !Number.isInteger(values.id) || values.id <= 0) {
    return { error: "Невалиден разход." };
  }

  const typeId = await resolveExpenceTypeId(values);

  await db
    .update(expences)
    .set({
      name: values.name,
      expencesTypeId: typeId,
      description: values.description,
      date: values.date,
      value: values.value,
    })
    .where(eq(expences.id, values.id));

  revalidateExpencePaths();

  return { success: "Разходът е обновен." };
}

export async function deleteExpenceAction(formData: FormData): Promise<ExpenceActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Невалиден разход." };
  }

  await db.delete(expences).where(eq(expences.id, id));

  revalidateExpencePaths();

  return { success: "Разходът е изтрит." };
}
