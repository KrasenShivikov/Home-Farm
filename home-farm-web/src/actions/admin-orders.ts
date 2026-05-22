"use server";

import { db } from "@/db";
import { crops, orderLines, orders, users } from "@/db/schema";
import { and, desc, eq, gte, ilike, lt, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-statuses";
import { revalidatePath } from "next/cache";

export type AdminOrderStatus = OrderStatus;

export type AdminOrderItem = {
  lineId?: number;
  cropId?: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
};

export type AdminOrder = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: AdminOrderStatus;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: AdminOrderItem[];
};

type JoinedOrderRow = {
  orderId: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: Date | string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  lineId?: number;
  cropId?: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
};

function isAdminOrderStatus(value: string): value is AdminOrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

function buildOrdersFromRows(rows: JoinedOrderRow[]) {
  const grouped = new Map<number, AdminOrder>();

  for (const row of rows) {
    const existing = grouped.get(row.orderId);

    if (!existing) {
      grouped.set(row.orderId, {
        id: row.orderId,
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        status: isAdminOrderStatus(row.status) ? row.status : "Pending",
        createdAt: new Date(row.createdAt).toISOString(),
        totalItems: 0,
        totalAmount: "0.00",
        shippingCity: row.shippingCity ?? null,
        shippingStreet: row.shippingStreet ?? null,
        shippingPostalCode: row.shippingPostalCode ?? null,
        shippingCountry: row.shippingCountry ?? null,
        items: [],
      });
    }

    if (!row.cropName) {
      continue;
    }

    const current = grouped.get(row.orderId)!;
    const quantity = Number(row.quantity || 0);
    const price = Number(row.price || 0);
    const lineTotal = quantity * price;

    current.items.push({
      lineId: row.lineId,
      cropId: row.cropId,
      cropName: row.cropName,
      cropVariety: row.cropVariety,
      quantity: row.quantity,
      price: row.price,
    });

    current.totalItems += 1;
    current.totalAmount = (Number(current.totalAmount) + lineTotal).toFixed(2);
  }

  return Array.from(grouped.values());
}

async function requireAdminSession() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

export type AdminOrdersFilter = {
  user?: string;
  date?: string;
  status?: string;
};

export async function getAdminOrders(filters: AdminOrdersFilter = {}): Promise<AdminOrder[]> {
  const conditions = [];

  if (filters.user) {
    const search = `%${filters.user.trim()}%`;
    conditions.push(sql`(${users.name} ilike ${search} or ${users.email} ilike ${search})`);
  }

  if (filters.date) {
    const selectedDate = new Date(`${filters.date}T00:00:00`);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    conditions.push(gte(orders.createdAt, selectedDate));
    conditions.push(lt(orders.createdAt, nextDate));
  }

  if (filters.status && isAdminOrderStatus(filters.status)) {
    conditions.push(eq(orders.status, filters.status));
  }

  const rows = await db
    .select({
      orderId: orders.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingCity: orders.shippingCity,
      shippingStreet: orders.shippingStreet,
      shippingPostalCode: orders.shippingPostalCode,
      shippingCountry: orders.shippingCountry,
      lineId: orderLines.id,
      cropId: crops.id,
      cropName: crops.name,
      cropVariety: crops.variety,
      quantity: orderLines.quantity,
      price: orderLines.price,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(crops, eq(crops.id, orderLines.cropId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.id));

  return buildOrdersFromRows(rows as JoinedOrderRow[]);
}

export async function getAdminOrderById(orderId: number): Promise<AdminOrder | null> {
  const rows = await db
    .select({
      orderId: orders.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingCity: orders.shippingCity,
      shippingStreet: orders.shippingStreet,
      shippingPostalCode: orders.shippingPostalCode,
      shippingCountry: orders.shippingCountry,
      lineId: orderLines.id,
      cropId: crops.id,
      cropName: crops.name,
      cropVariety: crops.variety,
      quantity: orderLines.quantity,
      price: orderLines.price,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(crops, eq(crops.id, orderLines.cropId))
    .where(eq(orders.id, orderId));

  const [order] = buildOrdersFromRows(rows as JoinedOrderRow[]);

  return order ?? null;
}

export async function updateAdminOrderStatusAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const session = await requireAdminSession();

  if (!session) {
    return { error: "Само администратор може да променя статус на поръчка." };
  }

  const orderId = Number(formData.get("orderId"));
  const statusValue = String(formData.get("status") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Невалидна поръчка." };
  }

  if (!isAdminOrderStatus(statusValue)) {
    return { error: "Изберете валиден статус." };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { error: "Поръчката не е намерена." };
  }

  await db.update(orders).set({ status: statusValue }).where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return { success: "Статусът на поръчката е обновен." };
}