"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, logout } from "@/lib/session";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Невалидни данни." };
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];

  if (!user || !user.passwordHash) {
    return { error: "Грешен имейл или парола." };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return { error: "Грешен имейл или парола." };
  }

  await createSession(user.id, user.name, user.role);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Всички полета са задължителни." };
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "Този имейл вече е регистриран." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      shippingCity: "",
      shippingStreet: "",
      shippingPostalCode: "",
      shippingCountry: "",
      role: "user",
    })
    .returning({ id: users.id, name: users.name, role: users.role });

  const newUser = inserted[0];
  if (!newUser) {
    return { error: "Грешка при регистрация." };
  }

  await createSession(newUser.id, newUser.name, newUser.role);
  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
