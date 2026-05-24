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
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Нова поръчка</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Създаване на поръчка</h1>
            <p className="mt-1 text-sm text-slate-600">Добавете продукти в кошницата, проверете адреса и изпратете заявката.</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm">
            Назад към таблото
          </Link>
        </div>
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
