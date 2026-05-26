import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthUser } from "@/lib/api-middleware";

function toProfile(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shippingCity: user.shippingCity ?? "",
    shippingStreet: user.shippingStreet ?? "",
    shippingPostalCode: user.shippingPostalCode ?? "",
    shippingCountry: user.shippingCountry ?? "",
  };
}

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Не сте влезли в системата." }, { status: 401 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, authUser.userId)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 });
  }

  return NextResponse.json({ user: toProfile(user) });
}

export async function PATCH(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Не сте влезли в системата." }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const shippingCity = String(body.shippingCity ?? "").trim();
  const shippingStreet = String(body.shippingStreet ?? "").trim();
  const shippingPostalCode = String(body.shippingPostalCode ?? "").trim();
  const shippingCountry = String(body.shippingCountry ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Име е задължително." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Въведете валиден имейл." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0 && existing[0].id !== authUser.userId) {
    return NextResponse.json({ error: "Имейлът вече е зает." }, { status: 409 });
  }

  const [updated] = await db
    .update(users)
    .set({
      name,
      email,
      shippingCity,
      shippingStreet,
      shippingPostalCode: shippingPostalCode || null,
      shippingCountry: shippingCountry || null,
    })
    .where(eq(users.id, authUser.userId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 });
  }

  return NextResponse.json({ user: toProfile(updated) });
}
