import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderLines, crops } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/api-middleware";

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
    const cropId = body.cropId;
    const quantity = body.quantity;

    if (!cropId || !quantity) {
      return NextResponse.json(
        { error: "cropId and quantity are required" },
        { status: 400 }
      );
    }

    const parsedCropId = Number(cropId);
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedCropId) || parsedCropId <= 0 || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ error: "Invalid crop or quantity" }, { status: 400 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Check order exists and belongs to user and is pending
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.userId)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "Pending") {
      return NextResponse.json(
        { error: "Order lines can only be added to Pending orders" },
        { status: 400 }
      );
    }

    // Check crop exists
    const [crop] = await db
      .select({ id: crops.id, forSale: crops.forSale, price: crops.price })
      .from(crops)
      .where(eq(crops.id, parsedCropId))
      .limit(1);

    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }
    if (!crop.forSale) {
      return NextResponse.json({ error: "Crop is not available for sale" }, { status: 400 });
    }
    if (crop.price == null) {
      return NextResponse.json({ error: "Selected crop has no price" }, { status: 400 });
    }

    const newLine = await db
      .insert(orderLines)
      .values({
        orderId,
        cropId: parsedCropId,
        quantity: String(quantity),
        price: crop.price,
      })
      .returning({ id: orderLines.id });

    return NextResponse.json({
      success: true,
      lineId: newLine[0].id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
