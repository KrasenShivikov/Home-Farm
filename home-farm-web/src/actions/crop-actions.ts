"use server";

import { db } from "@/db";
import { crops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CropActionState = {
  error?: string;
  success?: string;
};

type CropValues = {
  id: number | null;
  name: string;
  variety: string | null;
  forSale: boolean;
  price: string | null;
  description: string | null;
};

function getCropValues(formData: FormData) {
  const idValue = formData.get("id");
  const name = String(formData.get("name") ?? "").trim();
  const variety = String(formData.get("variety") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const forSale = formData.get("forSale") === "on";

  const id = idValue ? Number(idValue) : null;

  if (!name) {
    return { error: "Името е задължително." } as const;
  }

  return {
    id,
    name,
    variety: variety || null,
    forSale,
    price: price || null,
    description: description || null,
  } as const;
}

function getRevalidatePaths(id: number | null) {
  const paths = ["/admin"];

  if (id) {
    paths.push(`/admin/crops/${id}`);
  }

  return paths;
}

export async function createCropAction(
  _prevState: CropActionState | null,
  formData: FormData
): Promise<CropActionState> {
  const values = getCropValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  await db.insert(crops).values({
    name: values.name,
    variety: values.variety,
    forSale: values.forSale,
    price: values.price,
    description: values.description,
  });

  revalidatePath("/admin");

  return { success: "Културата е добавена." };
}

export async function updateCropAction(
  _prevState: CropActionState | null,
  formData: FormData
): Promise<CropActionState> {
  const values = getCropValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  if (!values.id || !Number.isInteger(values.id) || values.id <= 0) {
    return { error: "Невалидна култура." };
  }

  await db
    .update(crops)
    .set({
      name: values.name,
      variety: values.variety,
      forSale: values.forSale,
      price: values.price,
      description: values.description,
    })
    .where(eq(crops.id, values.id));

  for (const path of getRevalidatePaths(values.id)) {
    revalidatePath(path);
  }

  return { success: "Културата е обновена." };
}

export async function deleteCropAction(formData: FormData): Promise<CropActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Невалидна култура." };
  }

  await db.delete(crops).where(eq(crops.id, id));

  revalidatePath("/admin");

  return { success: "Културата е изтрита." };
}