import { getUserOrders } from "@/actions/user-dashboard";
import { getSession } from "@/lib/session";
import { formatBulgarianDate } from "@/lib/format-date";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Admins should not see the ordinary user dashboard
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

          {orders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
              Нямате поръчки.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Поръчка #{order.id}</p>
                      <h3 className="text-lg font-semibold text-slate-900">{order.status}</h3>
                      <p className="text-sm text-slate-600">Дата: {formatBulgarianDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <div className="text-right">
                        <p>Артикули: {order.totalItems}</p>
                        <p>Общо: {order.totalAmount} лв</p>
                      </div>
                      <Link href={`/dashboard/orders/${order.id}`} className="btn">
                        Детайли
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
