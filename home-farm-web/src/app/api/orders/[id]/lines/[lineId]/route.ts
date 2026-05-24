import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { orderLines, orders } from "@/db/schema";
import { getAuthUser } from "@/lib/api-middleware";

async function findEditableOrderLine(
  request: NextRequest,
  orderIdParam: string,
  lineIdParam: string
) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const orderId = parseInt(orderIdParam);
  const lineId = parseInt(lineIdParam);
  if (isNaN(orderId) || isNaN(lineId)) {
    return { error: NextResponse.json({ error: "Invalid order line ID" }, { status: 400 }) };
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.userId)))
    .limit(1);

  if (!order) {
    return { error: NextResponse.json({ error: "Order not found" }, { status: 404 }) };
  }

  if (order.status !== "Pending") {
    return {
      error: NextResponse.json(
        { error: "Order lines can only be edited on Pending orders" },
        { status: 400 }
      ),
    };
  }

  const [line] = await db
    .select({ id: orderLines.id })
    .from(orderLines)
    .where(and(eq(orderLines.id, lineId), eq(orderLines.orderId, orderId)))
    .limit(1);

  if (!line) {
    return { error: NextResponse.json({ error: "Order line not found" }, { status: 404 }) };
  }

  return { orderId, lineId };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    const { id, lineId } = await params;
    const result = await findEditableOrderLine(request, id, lineId);
    if ("error" in result) return result.error;

    const body = await request.json();
    const quantity = Number(body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 });
    }

    const [updated] = await db
      .update(orderLines)
      .set({ quantity: String(body.quantity) })
      .where(eq(orderLines.id, result.lineId))
      .returning({ id: orderLines.id, quantity: orderLines.quantity });

    return NextResponse.json({ success: true, line: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    const { id, lineId } = await params;
    const result = await findEditableOrderLine(request, id, lineId);
    if ("error" in result) return result.error;

    await db.delete(orderLines).where(eq(orderLines.id, result.lineId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
