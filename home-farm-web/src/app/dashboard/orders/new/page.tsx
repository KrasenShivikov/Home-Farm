import { getOrderableCrops } from "@/actions/user-dashboard";
import { db } from "@/db";
import { users } from "@/db/schema";
import OrderCartBuilder from "@/components/dashboard/OrderCartBuilder";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewOrderPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const orderableCrops = await getOrderableCrops();
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  return (
    <section className="container py-10">
      <div className="mb-6 space-y-2">
        <p className="eyebrow">Нова поръчка</p>
        <h1 className="text-3xl font-bold text-slate-900">Създаване на поръчка</h1>
        <p className="text-sm text-slate-600">Добавете няколко култури в кошница и изпратете поръчката.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="btn">
          Назад към таблото
        </Link>
      </div>

      <OrderCartBuilder
        crops={orderableCrops}
        shippingDefaults={{
          shippingCity: user?.shippingCity ?? "",
          shippingStreet: user?.shippingStreet ?? "",
          shippingPostalCode: user?.shippingPostalCode ?? "",
          shippingCountry: user?.shippingCountry ?? "",
        }}
      />
    </section>
  );
}
