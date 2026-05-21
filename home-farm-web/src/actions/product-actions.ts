"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ProductActionState = {
  error?: string;
  success?: string;
};

type ProductValues = {
  id: number | null;
  name: string;
  date: string;
};

function getProductValues(formData: FormData) {
  const idValue = formData.get("id");
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  const id = idValue ? Number(idValue) : null;

  if (!name || !date) {
    return { error: "Името и датата са задължителни." } as const;
  }

  return {
    id,
    name,
    date,
  } as const;
}

function revalidateProductPaths(id: number | null) {
  revalidatePath("/admin/products");

  if (id) {
    revalidatePath(`/admin/products/${id}`);
  }
}

export async function createProductAction(
  _prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const values = getProductValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  await db.insert(products).values({
    name: values.name,
    date: values.date,
  });

  revalidateProductPaths(null);

  return { success: "Продуктът е добавен." };
}

export async function updateProductAction(
  _prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const values = getProductValues(formData);

  if ("error" in values) {
    return { error: values.error };
  }

  if (!values.id || !Number.isInteger(values.id) || values.id <= 0) {
    return { error: "Невалиден продукт." };
  }

  await db
    .update(products)
    .set({
      name: values.name,
      date: values.date,
    })
    .where(eq(products.id, values.id));

  revalidateProductPaths(values.id);

  return { success: "Продуктът е обновен." };
}

export async function deleteProductAction(formData: FormData): Promise<ProductActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Невалиден продукт." };
  }

  await db.delete(products).where(eq(products.id, id));

  revalidateProductPaths(id);

  return { success: "Продуктът е изтрит." };
}