import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt } from "@/lib/session";

async function generateJWT(userId: number, name: string, role: string) {
  return await encrypt({ userId, name, role });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Име, имейл и парола са задължителни." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Паролата трябва да бъде поне 6 символа." },
        { status: 400 }
      );
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Този имейл вече е регистриран." },
        { status: 409 }
      );
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
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    const user = inserted[0];
    if (!user) {
      return NextResponse.json(
        { error: "Регистрацията не може да бъде завършена." },
        { status: 500 }
      );
    }

    const token = await generateJWT(user.id, user.name, user.role);

    return NextResponse.json({
      token,
      user,
    });
  } catch {
    return NextResponse.json({ error: "Вътрешна грешка на сървъра." }, { status: 500 });
  }
}
