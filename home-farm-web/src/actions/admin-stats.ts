"use server";

import { db } from "@/db";
import {
  crops,
  plantings,
  harvestings,
  wastes,
  products,
  cropProducts,
  orders,
  orderLines,
  users,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sql, type SQL } from "drizzle-orm";

type CropStats = {
  id: number;
  name: string;
  plantQty: string;
  harvestQty: string;
  harvestValue: string;
  wasteQty: string;
  wasteValue: string;
  avgHarvestPerPlanting: string | null;
  usedInProductsQty: string;
  usedInProductsValue: string;
};

type ProductUsedCrop = {
  cropId: number;
  cropName: string;
  qty: string;
  value: string;
};

type ProductStats = {
  id: number;
  name: string;
  qty: string;
  value: string;
  usedCrops: ProductUsedCrop[];
  cropsValueSum: string;
  addedValue: string;
};

export type AdminStats = {
  crops: CropStats[];
  products: ProductStats[];
  totals: {
    totalProductionQty: string;
    totalProductionValue: string;
    totalWastesQty: string;
    totalWastesValue: string;
    totalUsedCropsQty: string;
    totalUsedCropsValue: string;
    totalProductsQty: string;
    totalProductsValue: string;
    totalProductAddedValue: string;
    endTotalValue: string;
  };
  orders: {
    byStatus: { status: string; ordersCount: number; totalValue: string }[];
    byUserAndStatus: { userId: number; userName: string; status: string; ordersCount: number; totalValue: string }[];
    orderLines: { totalQty: string; totalValue: string };
  };
};

type AdminStatsFilters = {
  startDate?: string | null;
  endDate?: string | null;
  cropId?: number | null;
  productId?: number | null;
};

type ProductCountRow = {
  productId: number | string;
  qty: string | number;
};

type CropProductRow = {
  cropId: number | string;
  productId: number | string;
  qtyPerProduct: string | number;
};

type OrderStatusRow = {
  status: string;
  ordersCount: number | string;
  totalValue: string | number;
};

type UserStatusRow = {
  userId: number | string;
  userName: string;
  status: string;
  ordersCount: number | string;
  totalValue: string | number;
};

type OrderLinesRow = {
  totalQty: string | number;
  totalValue: string | number;
};

export async function getAdminStats(filters: AdminStatsFilters = {}): Promise<AdminStats> {
  const { startDate, endDate, cropId, productId } = filters;
  const start = startDate?.trim() || null;
  const end = endDate?.trim() || null;
  // Basic lists
  const cropsList = await db.select({ id: crops.id, name: crops.name, price: crops.price }).from(crops).orderBy(crops.name);

  const dateConditions: SQL[] = [];
  if (start) dateConditions.push(sql`${plantings.date} >= ${start}`);
  if (end) dateConditions.push(sql`${plantings.date} <= ${end}`);
  const dateWhere = dateConditions.length > 0 ? and(...dateConditions) : undefined;

  const plantAgg = await db
    .select({ cropId: plantings.cropId, plantQty: sql`coalesce(sum(${plantings.quantity})::numeric,0)` })
    .from(plantings)
    .where(cropId ? and(dateWhere, eq(plantings.cropId, cropId)) : dateWhere)
    .groupBy(plantings.cropId);

  const harvestDateCond: SQL[] = [];
  if (start) harvestDateCond.push(sql`${harvestings.date} >= ${start}`);
  if (end) harvestDateCond.push(sql`${harvestings.date} <= ${end}`);
  const harvestDateWhere = harvestDateCond.length > 0 ? and(...harvestDateCond) : undefined;

  const harvestAgg = await db
    .select({ cropId: harvestings.cropId, harvestQty: sql`coalesce(sum(${harvestings.quantity})::numeric,0)` })
    .from(harvestings)
    .where(cropId ? and(harvestDateWhere, eq(harvestings.cropId, cropId)) : harvestDateWhere)
    .groupBy(harvestings.cropId);

  const wasteDateCond: SQL[] = [];
  if (start) wasteDateCond.push(sql`${wastes.date} >= ${start}`);
  if (end) wasteDateCond.push(sql`${wastes.date} <= ${end}`);
  const wasteDateWhere = wasteDateCond.length > 0 ? and(...wasteDateCond) : undefined;

  const wasteAgg = await db
    .select({ cropId: wastes.cropId, wasteQty: sql`coalesce(sum(${wastes.quantity})::numeric,0)`, wasteKgQty: sql`coalesce(sum(case when ${wastes.type} = 'кг' then ${wastes.quantity} else 0 end)::numeric,0)` })
    .from(wastes)
    .where(cropId ? and(wasteDateWhere, eq(wastes.cropId, cropId)) : wasteDateWhere)
    .groupBy(wastes.cropId);

  // Products quantities per product id can be filtered by product date range and optionally productId
  const prodDateCond: SQL[] = [];
  if (start) prodDateCond.push(sql`${products.date} >= ${start}`);
  if (end) prodDateCond.push(sql`${products.date} <= ${end}`);
  const prodDateWhere = prodDateCond.length > 0 ? and(...prodDateCond) : undefined;

  const productCountsRows = await db
    .select({ productId: products.id, qty: sql`coalesce(sum(${products.quantity})::numeric,0)` })
    .from(products)
    .where(productId ? and(prodDateWhere, eq(products.id, productId)) : prodDateWhere)
    .groupBy(products.id);
  const productCounts = new Map<number, number>();
  for (const r of productCountsRows as ProductCountRow[]) {
    productCounts.set(Number(r.productId), Number(r.qty));
  }

  // crop_products: quantity of crop assigned to the product entry
  // recipe rows, optionally limited to a productId
  const cpRows = await db
    .select({ cropId: cropProducts.cropId, productId: cropProducts.productId, qtyPerProduct: cropProducts.quantity })
    .from(cropProducts)
    .where(productId || cropId ? and(productId ? eq(cropProducts.productId, productId) : undefined, cropId ? eq(cropProducts.cropId, cropId) : undefined) : undefined);

  // Build usedInProducts per crop and per product
  const usedInProductsMap = new Map<number, number>(); // cropId -> qty
  const productUsedCropsMap = new Map<number, ProductUsedCrop[]>();

  for (const r of cpRows as CropProductRow[]) {
    const pid = Number(r.productId);
    const cid = Number(r.cropId);
    const qtyPerProduct = Number(r.qtyPerProduct || 0);
    const totalUsed = qtyPerProduct;

    usedInProductsMap.set(cid, (usedInProductsMap.get(cid) ?? 0) + totalUsed);

    if (!productUsedCropsMap.has(pid)) productUsedCropsMap.set(pid, []);
    productUsedCropsMap.get(pid)!.push({
      cropId: cid,
      cropName: "",
      qty: totalUsed.toFixed(3),
      value: "0.00",
    });
  }

  // Map helper to find names and prices
  const cropInfo = new Map<number, { name: string; price: string | null }>();
  for (const c of cropsList) {
    cropInfo.set(Number(c.id), { name: String(c.name), price: c.price as string | null });
  }

  const cropIdsInRange = new Set<number>();
  if (start || end) {
    for (const row of [...plantAgg, ...harvestAgg, ...wasteAgg]) {
      cropIdsInRange.add(Number((row as { cropId: number }).cropId));
    }
  }

  // Compose crop stats
  const cropsStats: CropStats[] = cropsList
    .filter((c) => !start && !end ? true : cropIdsInRange.has(Number(c.id)) || cropId === Number(c.id))
    .map((c) => {
    const cid = Number(c.id);
    const plantQty = (plantAgg.find((x: { cropId: number; plantQty: unknown }) => Number(x.cropId) === cid)?.plantQty as string) ?? "0";
    const harvestQty = (harvestAgg.find((x: { cropId: number; harvestQty: unknown }) => Number(x.cropId) === cid)?.harvestQty as string) ?? "0";
    const wasteQty = (wasteAgg.find((x: { cropId: number; wasteQty: unknown }) => Number(x.cropId) === cid)?.wasteQty as string) ?? "0";
    const wasteKgQty = (wasteAgg.find((x: { cropId: number; wasteKgQty: unknown }) => Number(x.cropId) === cid)?.wasteKgQty as string) ?? "0";
    const usedQty = usedInProductsMap.get(cid) ?? 0;
    const price = c.price ? Number(c.price) : 0;

    const harvestValue = (Number(harvestQty || 0) * price).toFixed(2);
    const wasteValue = (Number(wasteKgQty || 0) * price).toFixed(2);
    const usedInProductsValue = (usedQty * price).toFixed(2);
    const avgHarvest = Number(plantQty || 0) > 0 ? (Number(harvestQty || 0) / Number(plantQty || 0)).toFixed(3) : null;

    return {
      id: cid,
      name: String(c.name),
      plantQty: String(plantQty ?? "0"),
      harvestQty: String(harvestQty ?? "0"),
      harvestValue,
      wasteQty: String(wasteQty ?? "0"),
      wasteValue,
      avgHarvestPerPlanting: avgHarvest,
      usedInProductsQty: usedQty.toFixed(3),
      usedInProductsValue,
    };
  });

  // Products stats
  // product list (filter by date range and productId if provided)
  const productsList = await db
    .select({ id: products.id, name: products.name, price: products.price, quantity: products.quantity, date: products.date })
    .from(products)
    .where(productId ? and(prodDateWhere, eq(products.id, productId)) : prodDateWhere)
    .orderBy(products.date);
  const productAggregates = new Map<number, number>();
  for (const [pid, qty] of productCounts.entries()) productAggregates.set(pid, qty);

  const productsStats: ProductStats[] = [];
  for (const p of productsList) {
    const pid = Number(p.id);
    const qty = productAggregates.get(pid) ?? 0;
    const price = p.price ? Number(p.price) : 0;
    const value = (qty * price).toFixed(2);

    const usedCropsRaw = productUsedCropsMap.get(pid) ?? [];
    const usedCrops: ProductUsedCrop[] = usedCropsRaw.map((uc) => {
      const info = cropInfo.get(uc.cropId)!;
      const cropPrice = info.price ? Number(info.price) : 0;
      const v = (Number(uc.qty) * cropPrice).toFixed(2);
      return { cropId: uc.cropId, cropName: info.name, qty: String(uc.qty), value: v };
    });

    const cropsValueSum = usedCrops.reduce((s, x) => s + Number(x.value), 0).toFixed(2);
    const addedValue = (Number(value) - Number(cropsValueSum)).toFixed(2);

    productsStats.push({ id: pid, name: String(p.name), qty: String(qty), value, usedCrops, cropsValueSum, addedValue });
  }

  // Totals
  const totalProductionQty = cropsStats.reduce((s, c) => s + Number(c.harvestQty || 0), 0).toFixed(3);
  const totalProductionValue = cropsStats.reduce((s, c) => s + Number(c.harvestValue || 0), 0).toFixed(2);
  const totalWastesQty = cropsStats.reduce((s, c) => s + Number(c.wasteQty || 0), 0).toFixed(3);
  const totalWastesValue = cropsStats.reduce((s, c) => s + Number(c.wasteValue || 0), 0).toFixed(2);
  const totalUsedCropsQty = Array.from(usedInProductsMap.values()).reduce((s, v) => s + v, 0).toFixed(3);
  // compute used crops value sum across crops
  let totalUsedCropsValueNum = 0;
  for (const [cid, qty] of usedInProductsMap.entries()) {
    const p = cropInfo.get(cid);
    const price = p?.price ? Number(p.price) : 0;
    totalUsedCropsValueNum += qty * price;
  }
  const totalUsedCropsValue = totalUsedCropsValueNum.toFixed(2);
  const totalProductsQty = Array.from(productCounts.values()).reduce((s, v) => s + v, 0).toFixed(3);
  const totalProductsValue = Array.from(productAggregates.entries()).reduce((s, [pid, cnt]) => {
    const prod = productsList.find((x) => Number(x.id) === Number(pid));
    const pr = prod?.price ? Number(prod.price) : 0;
    return s + cnt * pr;
  }, 0).toFixed(2);
  const totalProductAddedValue = (Number(totalProductsValue) - Number(totalUsedCropsValue)).toFixed(2);

  const endTotalValue = (Number(totalProductionValue) - Number(totalWastesValue) + Number(totalProductAddedValue)).toFixed(2);

  // Orders stats
  const ordersByStatus = await db
    .select({ status: orders.status, ordersCount: sql`count(distinct ${orders.id})::int`, totalValue: sql`coalesce(sum(${orderLines.quantity} * ${orderLines.price}),0)` })
    .from(orders)
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .groupBy(orders.status);

  const byUserAndStatus = await db
    .select({ userId: users.id, userName: users.name, status: orders.status, ordersCount: sql`count(distinct ${orders.id})::int`, totalValue: sql`coalesce(sum(${orderLines.quantity} * ${orderLines.price}),0)` })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .groupBy(users.id, users.name, orders.status);

  const orderLinesAgg = await db
    .select({ totalQty: sql`coalesce(sum(${orderLines.quantity}),0)`, totalValue: sql`coalesce(sum(${orderLines.quantity} * ${orderLines.price}),0)` })
    .from(orderLines);

  return {
    crops: cropsStats,
    products: productsStats,
    totals: {
      totalProductionQty: totalProductionQty,
      totalProductionValue: totalProductionValue,
      totalWastesQty: totalWastesQty,
      totalWastesValue: totalWastesValue,
      totalUsedCropsQty: totalUsedCropsQty,
      totalUsedCropsValue: totalUsedCropsValue,
      totalProductsQty: totalProductsQty,
      totalProductsValue: totalProductsValue,
      totalProductAddedValue: totalProductAddedValue,
      endTotalValue: endTotalValue,
    },
    orders: {
      byStatus: (ordersByStatus as OrderStatusRow[]).map((r) => ({ status: r.status, ordersCount: Number(r.ordersCount), totalValue: String(r.totalValue ?? "0") })),
      byUserAndStatus: (byUserAndStatus as UserStatusRow[]).map((r) => ({ userId: Number(r.userId), userName: r.userName, status: r.status, ordersCount: Number(r.ordersCount), totalValue: String(r.totalValue ?? "0") })),
      orderLines: { totalQty: String((orderLinesAgg as OrderLinesRow[])[0]?.totalQty ?? "0"), totalValue: String((orderLinesAgg as OrderLinesRow[])[0]?.totalValue ?? "0") },
    },
  };
}
