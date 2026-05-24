import { getUserOrders } from "@/actions/user-dashboard";
import DashboardOrdersList from "@/components/dashboard/DashboardOrdersList";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const orders = await getUserOrders(session.userId);

  return (
    <section className="container py-10">
      <div className="mb-8 space-y-2">
        <p className="eyebrow">Потребителско табло</p>
        <h1 className="text-3xl font-bold text-slate-900">Здравейте, {session.name}</h1>
        <p className="text-sm text-slate-600">Тук можете да видите вашите поръчки.</p>
      </div>

      <div className="space-y-4">
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Вашите поръчки</p>
              <h2 className="text-xl font-semibold text-slate-900">Списък с поръчки</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-600">Общо поръчки: {orders.length}</p>
              <Link href="/dashboard/orders/new" target="_blank" rel="noreferrer" className="btn btn-primary">
                Добави поръчка
              </Link>
            </div>
          </div>

          <DashboardOrdersList orders={orders} />
        </section>
      </div>
    </section>
  );
}
