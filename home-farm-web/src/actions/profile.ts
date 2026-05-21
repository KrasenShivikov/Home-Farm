"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function updateProfileAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const session = await getSession();

  if (!session) {
    return { error: "Трябва да влезете в системата." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const shippingCity = String(formData.get("shippingCity") ?? "").trim();
  const shippingStreet = String(formData.get("shippingStreet") ?? "").trim();
  const shippingPostalCode = String(formData.get("shippingPostalCode") ?? "").trim();
  const shippingCountry = String(formData.get("shippingCountry") ?? "").trim();

  if (!name) return { error: "Име е задължително." };
  if (!email || !email.includes("@")) return { error: "Въведете валиден имейл." };

  // Ensure email uniqueness
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0 && existing[0].id !== session.userId) {
    return { error: "Имейлът вече е зает." };
  }

  await db
    .update(users)
    .set({
      name,
      email,
      shippingCity,
      shippingStreet,
      shippingPostalCode: shippingPostalCode || null,
      shippingCountry: shippingCountry || null,
    })
    .where(eq(users.id, session.userId));

  return { success: "Профилът е обновен." };
}
