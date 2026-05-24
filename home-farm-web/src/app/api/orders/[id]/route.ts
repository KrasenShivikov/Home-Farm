import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderLines, crops } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/api-middleware";

interface OrderLineWithCrop {
  lineId: number;
  cropId: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
}

interface OrderDetail {
  id: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: OrderLineWithCrop[];
}

interface OrderRow {
  orderId: number;
  status: string;
  createdAt: Date | string;
  shippingCity: string | null;
  shippingStreet: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  lineId: number | null;
  cropId: number | null;
  cropName: string | null;
  cropVariety: string | null;
  quantity: string | null;
  price: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

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
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.userId)));

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = buildOrderFromRows(rows);
    if (order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: order[0] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.userId)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await db.delete(orders).where(eq(orders.id, orderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildOrderFromRows(rows: OrderRow[]) {
  const grouped = new Map<number, OrderDetail>();

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

    if (
      !row.cropName ||
      row.lineId === null ||
      row.cropId === null ||
      row.quantity === null ||
      row.price === null
    ) {
      continue;
    }

    const current = grouped.get(row.orderId)!;
    current.items.push({
      lineId: row.lineId,
      cropId: row.cropId,
      cropName: row.cropName,
      cropVariety: row.cropVariety,
      quantity: row.quantity,
      price: row.price,
    });
    current.totalItems += 1;
    const lineTotal = Number(row.quantity || 0) * Number(row.price || 0);
    current.totalAmount = (Number(current.totalAmount) + lineTotal).toFixed(2);
  }

  return Array.from(grouped.values());
}
