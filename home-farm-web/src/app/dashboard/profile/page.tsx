import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    redirect("/");
  }

  const initial = {
    name: user.name,
    email: user.email,
    shippingCity: user.shippingCity ?? null,
    shippingStreet: user.shippingStreet ?? null,
    shippingPostalCode: user.shippingPostalCode ?? null,
    shippingCountry: user.shippingCountry ?? null,
  };

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Профил</h1>
        <p className="text-sm text-gray-600">Попълнете или обновете вашите потребителски данни</p>
      </div>

      <ProfileForm initial={initial} />
    </section>
  );
}
