import { getAdminOrders } from "@/actions/admin-orders";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminOrdersSearchPanel from "@/components/admin/AdminOrdersSearchPanel";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatBulgarianDate } from "@/lib/format-date";
import Link from "next/link";

export const metadata = {
  title: "Admin — Поръчки",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; date?: string; status?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = params.user ?? "";
  const date = params.date ?? "";
  const status = params.status ?? "";

  const orders = await getAdminOrders({ user, date, status });

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Поръчки</h1>
        <p className="text-sm text-gray-600">Преглед на всички потребителски поръчки</p>
      </div>

      <AdminTabs active="orders" />

  <AdminOrdersSearchPanel user={user} date={date} status={status} />

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">Няма поръчки.</div>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Поръчка #{order.id}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">{order.userName}</h2>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-slate-600">{order.userEmail}</p>
                  <p className="text-sm text-slate-600">Дата: {formatBulgarianDate(order.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div className="text-right">
                    <p>Артикули: {order.totalItems}</p>
                    <p>Общо: {order.totalAmount} лв</p>
                  </div>
                  <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)] transition-all hover:-translate-y-px hover:bg-orange-600">
                    Детайли
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}