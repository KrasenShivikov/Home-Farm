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
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Нова поръчка</p>
        <h1 className="text-3xl font-bold text-slate-900">Създаване на поръчка</h1>
        <p className="text-sm text-slate-600">Добавете няколко култури в кошница и изпратете поръчката.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm">
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
