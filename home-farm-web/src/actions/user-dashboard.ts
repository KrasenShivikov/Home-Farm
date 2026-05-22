"use server";

import { db } from "@/db";
import { crops, orderLines, orders, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type UserOrderItem = {
  lineId?: number;
  cropId?: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
  lineTotal: string;
};

export type UserOrder = {
  id: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: UserOrderItem[];
};

export type UserOrderDetail = {
  id: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: UserOrderItem[];
};

export type OrderableCrop = {
  id: number;
  name: string;
  variety: string | null;
  price: string | null;
};

export type CartItemInput = {
  cropId: number;
  quantity: string;
};

type JoinedOrderRow = {
  orderId: number;
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

function buildOrderFromRows(rows: JoinedOrderRow[]) {
  const grouped = new Map<number, UserOrder>();

  for (const row of rows) {
    const existing = grouped.get(row.orderId);

    if (!existing) {
      grouped.set(row.orderId, {
        id: row.orderId,
        status: row.status,
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
      lineTotal: lineTotal.toFixed(2),
    });

    current.totalItems += 1;
    current.totalAmount = (Number(current.totalAmount) + lineTotal).toFixed(2);
  }

  return Array.from(grouped.values());
}

export async function getUserOrders(userId: number): Promise<UserOrder[]> {
  const rows = await db
    .select({
      orderId: orders.id,
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
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(crops, eq(crops.id, orderLines.cropId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id));

  return buildOrderFromRows(rows as JoinedOrderRow[]);
}

export async function getUserOrderById(userId: number, orderId: number): Promise<UserOrderDetail | null> {
  const rows = await db
    .select({
      orderId: orders.id,
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
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .leftJoin(crops, eq(crops.id, orderLines.cropId))
    .where(and(eq(orders.userId, userId), eq(orders.id, orderId)));

  const [order] = buildOrderFromRows(rows as JoinedOrderRow[]);

  return order ?? null;
}

export async function addOrderLineAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const orderId = Number(formData.get("orderId"));
  const cropId = Number(formData.get("cropId"));
  const quantityRaw = String(formData.get("quantity") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Невалидна поръчка." };
  }

  if (!Number.isInteger(cropId) || cropId <= 0) {
    return { error: "Изберете валидна култура." };
  }

  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Количеството трябва да е число по-голямо от 0." };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.userId)))
    .limit(1);

  if (!order) {
    return { error: "Поръчката не е намерена." };
  }

  if (order.status !== "Pending") {
    return { error: "Можете да редактирате само чакащи поръчки." };
  }

  const [crop] = await db.select().from(crops).where(eq(crops.id, cropId)).limit(1);

  if (!crop) {
    return { error: "Културата не е намерена." };
  }

  if (!crop.forSale) {
    return { error: "Тази култура не е налична за поръчка." };
  }

  if (crop.price == null) {
    return { error: "Липсва цена за избраната култура." };
  }

  const existingLine = await db
    .select({ id: orderLines.id, quantity: orderLines.quantity })
    .from(orderLines)
    .where(and(eq(orderLines.orderId, orderId), eq(orderLines.cropId, cropId)))
    .limit(1);

  const [line] = existingLine;

  if (line) {
    const nextQuantity = (Number(line.quantity) + quantity).toFixed(3);

    await db
      .update(orderLines)
      .set({ quantity: nextQuantity, price: crop.price })
      .where(eq(orderLines.id, line.id));

    return { success: "Културата е обновена в поръчката." };
  }

  await db.insert(orderLines).values({
    orderId,
    cropId,
    quantity: quantityRaw,
    price: crop.price,
  });

  return { success: "Културата е добавена към поръчката." };
}

export async function updateOrderLineAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const orderId = Number(formData.get("orderId"));
  const lineId = Number(formData.get("lineId"));
  const cropId = Number(formData.get("cropId"));
  const quantityRaw = String(formData.get("quantity") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(lineId) || lineId <= 0) {
    return { error: "Невалидна линия." };
  }

  if (!Number.isInteger(cropId) || cropId <= 0) {
    return { error: "Изберете валидна култура." };
  }

  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Количеството трябва да е число по-голямо от 0." };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.userId)))
    .limit(1);

  if (!order) {
    return { error: "Поръчката не е намерена." };
  }

  if (order.status !== "Pending") {
    return { error: "Можете да редактирате само чакащи поръчки." };
  }

  const [currentLine] = await db
    .select({ id: orderLines.id, cropId: orderLines.cropId })
    .from(orderLines)
    .where(and(eq(orderLines.id, lineId), eq(orderLines.orderId, orderId)))
    .limit(1);

  if (!currentLine) {
    return { error: "Редът не е намерен." };
  }

  const [crop] = await db.select().from(crops).where(eq(crops.id, cropId)).limit(1);

  if (!crop) {
    return { error: "Културата не е намерена." };
  }

  if (!crop.forSale) {
    return { error: "Тази култура не е налична за поръчка." };
  }

  if (crop.price == null) {
    return { error: "Липсва цена за избраната култура." };
  }

  const duplicateLine = await db
    .select({ id: orderLines.id, quantity: orderLines.quantity })
    .from(orderLines)
    .where(and(eq(orderLines.orderId, orderId), eq(orderLines.cropId, cropId)))
    .limit(1);

  const [duplicate] = duplicateLine;

  if (duplicate && duplicate.id !== currentLine.id) {
    return { error: "Тази култура вече съществува в поръчката. Редактирайте нейния ред вместо това." };
  }

  await db
    .update(orderLines)
    .set({ cropId, quantity: quantityRaw, price: crop.price })
    .where(eq(orderLines.id, currentLine.id));

  return { success: "Редът е обновен успешно." };
}

export async function getOrderableCrops(): Promise<OrderableCrop[]> {
  return db
    .select({
      id: crops.id,
      name: crops.name,
      variety: crops.variety,
      price: crops.price,
    })
    .from(crops)
    .where(eq(crops.forSale, true))
    .orderBy(crops.name);
}

function parseCartItems(rawValue: FormDataEntryValue | null): CartItemInput[] {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const candidate = item as Partial<CartItemInput>;
        if (typeof candidate.cropId !== "number" || typeof candidate.quantity !== "string") {
          return null;
        }

        return {
          cropId: candidate.cropId,
          quantity: candidate.quantity,
        };
      })
      .filter((item): item is CartItemInput => item !== null);
  } catch {
    return [];
  }
}

export async function createOrderAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const cartItems = parseCartItems(formData.get("cartJson"));

  if (cartItems.length === 0) {
    return { error: "Кошницата е празна." };
  }

  const normalizedCart: Array<{ cropId: number; quantity: string; price: string }> = [];

  const shippingCityInput = String(formData.get("shippingCity") ?? "").trim();
  const shippingStreetInput = String(formData.get("shippingStreet") ?? "").trim();
  const shippingPostalCodeInput = String(formData.get("shippingPostalCode") ?? "").trim();
  const shippingCountryInput = String(formData.get("shippingCountry") ?? "").trim();

  let shippingCity = shippingCityInput;
  let shippingStreet = shippingStreetInput;
  let shippingPostalCode = shippingPostalCodeInput;
  let shippingCountry = shippingCountryInput;

  if (!shippingCity || !shippingStreet || !shippingPostalCode || !shippingCountry) {
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (user) {
      shippingCity ||= user.shippingCity;
      shippingStreet ||= user.shippingStreet;
      shippingPostalCode ||= user.shippingPostalCode ?? "";
      shippingCountry ||= user.shippingCountry ?? "";
    }
  }

  if (!shippingCity || !shippingStreet || !shippingPostalCode || !shippingCountry) {
    return { error: "Попълнете данните за доставка." };
  }

  for (const item of cartItems) {
    if (!Number.isInteger(item.cropId) || item.cropId <= 0) {
      return { error: "Кошницата съдържа невалидна култура." };
    }

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Кошницата съдържа невалидно количество." };
    }

    const [crop] = await db.select().from(crops).where(eq(crops.id, item.cropId)).limit(1);

    if (!crop) {
      return { error: "Културата не е намерена." };
    }

    if (!crop.forSale) {
      return { error: `${crop.name} не е налична за поръчка.` };
    }

    if (crop.price == null) {
      return { error: `Липсва цена за ${crop.name}.` };
    }

    normalizedCart.push({
      cropId: crop.id,
      quantity: item.quantity,
      price: crop.price,
    });
  }

  const [order] = await db
    .insert(orders)
    .values({
      userId: session.userId,
      status: "Pending",
      shippingCity,
      shippingStreet,
      shippingPostalCode,
      shippingCountry,
    })
    .returning({ id: orders.id });

  if (!order) {
    return { error: "Неуспешно създаване на поръчка." };
  }

  try {
    for (const item of normalizedCart) {
      await db.insert(orderLines).values({
        orderId: order.id,
        cropId: item.cropId,
        quantity: item.quantity,
        price: item.price,
      });
    }
  } catch (error) {
    await db.delete(orders).where(eq(orders.id, order.id));
    return { error: "Неуспешно създаване на поръчката." };
  }

  redirect("/dashboard");
}

export async function cancelOrderAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const orderId = Number(formData.get("orderId"));

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Невалидна поръчка." };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.userId)))
    .limit(1);

  if (!order) {
    return { error: "Поръчката не е намерена." };
  }

  if (order.status === "Cancelled") {
    return { error: "Поръчката вече е отказана." };
  }

  if (order.status === "Completed") {
    return { error: "Завършена поръчка не може да бъде отказана." };
  }

  await db.update(orders).set({ status: "Cancelled" }).where(eq(orders.id, orderId));

  return { success: "Поръчката е отказана." };
}

export async function deleteOrderAction(_prevState: { error?: string; success?: string } | null, formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const orderId = Number(formData.get("orderId"));

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Невалидна поръчка." };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.userId)))
    .limit(1);

  if (!order) {
    return { error: "Поръчката не е намерена." };
  }

  if (order.status === "Completed") {
    return { error: "Завършена поръчка не може да бъде изтрита." };
  }

  await db.delete(orders).where(eq(orders.id, orderId));

  return { success: "Поръчката е изтрита." };
}
