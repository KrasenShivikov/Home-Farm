import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderLines, crops, users } from "@/db/schema";
import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { getAuthUser } from "@/lib/api-middleware";
import { isOrderStatus } from "@/lib/order-statuses";

interface OrderLineWithCrop {
  lineId: number;
  cropId: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
}

interface OrderWithItems {
  id: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  userName?: string | null;
  userEmail?: string | null;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: OrderLineWithCrop[];
}

function buildOrderFromRows(rows: any[]) {
  const grouped = new Map<number, OrderWithItems>();

  for (const row of rows) {
    const existing = grouped.get(row.orderId);

    if (!existing) {
      grouped.set(row.orderId, {
        id: row.orderId,
        status: row.status,
        createdAt: new Date(row.createdAt).toISOString(),
        totalItems: 0,
        totalAmount: "0.00",
        userName: row.userName ?? null,
        userEmail: row.userEmail ?? null,
        shippingCity: row.shippingCity ?? null,
        shippingStreet: row.shippingStreet ?? null,
        shippingPostalCode: row.shippingPostalCode ?? null,
        shippingCountry: row.shippingCountry ?? null,
        items: [],
      });
    }

    if (!row.cropName) continue;

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const userTerm = searchParams.get("user")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    if (user.role !== "admin") {
      conditions.push(eq(orders.userId, user.userId));
    }

    if (status && isOrderStatus(status)) {
      conditions.push(eq(orders.status, status));
    }

    if (user.role === "admin" && userTerm) {
      conditions.push(or(ilike(users.name, `%${userTerm}%`), ilike(users.email, `%${userTerm}%`))!);
    }

    if (startDate) {
      conditions.push(sql`${orders.createdAt}::date >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${orders.createdAt}::date <= ${endDate}`);
    }

    const orderIdRows = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .where(conditions.length > 0 ? and(...conditions) : sql`true`)
      .orderBy(desc(orders.id))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = orderIdRows.length > limit;
    const pageOrderIds = orderIdRows.slice(0, limit).map((order) => order.id);

    if (pageOrderIds.length === 0) {
      return NextResponse.json({
        orders: [],
        pagination: {
          page,
          limit,
          hasMore,
        },
      });
    }

    const rows = await db
      .select({
        orderId: orders.id,
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
      .where(inArray(orders.id, pageOrderIds))
      .orderBy(desc(orders.id));

    const ordersList = buildOrderFromRows(rows);

    return NextResponse.json({
      orders: ordersList,
      pagination: {
        page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [currentUser] = await db
      .select({
        shippingCity: users.shippingCity,
        shippingStreet: users.shippingStreet,
        shippingPostalCode: users.shippingPostalCode,
        shippingCountry: users.shippingCountry,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    const [order] = await db
      .insert(orders)
      .values({
        userId: user.userId,
        status: "Pending",
        shippingCity: currentUser?.shippingCity ?? null,
        shippingStreet: currentUser?.shippingStreet ?? null,
        shippingPostalCode: currentUser?.shippingPostalCode ?? null,
        shippingCountry: currentUser?.shippingCountry ?? null,
      })
      .returning({
        id: orders.id,
        status: orders.status,
        createdAt: orders.createdAt,
      });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
