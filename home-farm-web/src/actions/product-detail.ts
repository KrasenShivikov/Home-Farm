"use server";

import { db } from "@/db";
import { cropProducts, crops, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProductById(productId: number) {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

  return product ?? null;
}

export async function getAllCropsForProductLinking() {
  return db
    .select({
      id: crops.id,
      name: crops.name,
      variety: crops.variety,
    })
    .from(crops)
    .orderBy(crops.name);
}

export async function getLinkedCropsForProduct(productId: number) {
  return db
    .select({
      cropId: crops.id,
      cropName: crops.name,
      cropVariety: crops.variety,
      quantity: cropProducts.quantity,
    })
    .from(cropProducts)
    .innerJoin(crops, eq(cropProducts.cropId, crops.id))
    .where(eq(cropProducts.productId, productId))
    .orderBy(crops.name);
}
