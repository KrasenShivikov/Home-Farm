import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/api-middleware";
import { ORDER_STATUSES } from "@/lib/order-statuses";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const status = body.status as string | undefined;

    if (!status || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json(
        { error: "Invalid status. Allowed: " + ORDER_STATUSES.join(", ") },
        { status: 400 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const [result] = await db
      .update(orders)
      .set({ status })
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.userId)))
      .returning({ id: orders.id, status: orders.status });

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
