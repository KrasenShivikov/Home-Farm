import { getOrderableCrops } from "@/actions/user-dashboard";
import OrderCartBuilder from "@/components/dashboard/OrderCartBuilder";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewOrderPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const orderableCrops = await getOrderableCrops();

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

      <OrderCartBuilder crops={orderableCrops} />
    </section>
  );
}
