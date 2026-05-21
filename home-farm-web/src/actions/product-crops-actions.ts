"use server";

import { db } from "@/db";
import { cropProducts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ProductCropActionState = {
  error?: string;
  success?: string;
};

function getIds(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const cropId = Number(formData.get("cropId"));

  if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(cropId) || cropId <= 0) {
    return { error: "Невалидна заявка." } as const;
  }

  return { productId, cropId } as const;
}

function getQuantity(formData: FormData) {
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = Number(quantityRaw);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Количеството трябва да е число по-голямо от 0." } as const;
  }

  return { quantityRaw } as const;
}

export async function addCropToProductAction(
  _prevState: ProductCropActionState | null,
  formData: FormData
): Promise<ProductCropActionState> {
  const ids = getIds(formData);
  if ("error" in ids) {
    return { error: ids.error };
  }

  const quantity = getQuantity(formData);
  if ("error" in quantity) {
    return { error: quantity.error };
  }

  const [existing] = await db
    .select()
    .from(cropProducts)
    .where(and(eq(cropProducts.productId, ids.productId), eq(cropProducts.cropId, ids.cropId)))
    .limit(1);

  if (existing) {
    return { error: "Културата вече е добавена. Използвайте Редакция." };
  }

  await db
    .insert(cropProducts)
    .values({
      productId: ids.productId,
      cropId: ids.cropId,
      quantity: quantity.quantityRaw,
    });

  revalidatePath(`/admin/products/${ids.productId}`);

  return { success: "Културата е добавена към продукта." };
}

export async function updateCropInProductAction(
  _prevState: ProductCropActionState | null,
  formData: FormData
): Promise<ProductCropActionState> {
  const ids = getIds(formData);
  if ("error" in ids) {
    return { error: ids.error };
  }

  const quantity = getQuantity(formData);
  if ("error" in quantity) {
    return { error: quantity.error };
  }

  await db
    .update(cropProducts)
    .set({ quantity: quantity.quantityRaw })
    .where(and(eq(cropProducts.productId, ids.productId), eq(cropProducts.cropId, ids.cropId)));

  revalidatePath(`/admin/products/${ids.productId}`);

  return { success: "Количеството е обновено." };
}

export async function removeCropFromProductAction(
  _prevState: ProductCropActionState | null,
  formData: FormData
): Promise<ProductCropActionState> {
  const ids = getIds(formData);

  if ("error" in ids) {
    return { error: ids.error };
  }

  await db
    .delete(cropProducts)
    .where(and(eq(cropProducts.productId, ids.productId), eq(cropProducts.cropId, ids.cropId)));

  revalidatePath(`/admin/products/${ids.productId}`);

  return { success: "Културата е премахната от продукта." };
}
