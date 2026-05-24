import { getAdminOrderById } from "@/actions/admin-orders";
import AdminTabs from "@/components/admin/AdminTabs";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { formatBulgarianDate } from "@/lib/format-date";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  const { id: idParam } = await params;
  const orderId = Number(idParam);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <div className="container py-10">Невалидна поръчка.</div>;
  }

  const order = await getAdminOrderById(orderId);

  if (!order) {
    return <div className="container py-10">Поръчката не е намерена.</div>;
  }

  const totalAmount = Number(order.totalAmount).toFixed(2);

  return (
    <section className="container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Поръчка #{order.id}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Администраторски преглед</h1>
          <p className="mt-1 text-sm text-slate-600">Детайли, доставка и управление на статус.</p>
        </div>
        <Link href="/admin/orders" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-px hover:border-slate-400">
          Към поръчките
        </Link>
      </div>

      <AdminTabs active="orders" />

      <div className="space-y-6">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-5 border-b border-slate-100 bg-slate-50/80 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.4fr)]">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-slate-400">Потребител</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="truncate text-2xl font-bold text-slate-950">{order.userName}</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                <span>{order.userEmail}</span>
                <span>{formatBulgarianDate(order.createdAt)}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">Артикули</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-950">{order.totalItems}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 shadow-sm">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-600">Общо</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">{totalAmount} €</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <OrderStatusForm orderId={order.id} status={order.status} />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Доставка</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Данни за доставка</h3>
              </div>
              <dl className="grid gap-3 px-5 py-5 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Град</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{order.shippingCity ?? "-"}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Пощ. код</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{order.shippingPostalCode ?? "-"}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Адрес</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{order.shippingStreet ?? "-"}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Държава</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{order.shippingCountry ?? "-"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Редове</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Артикули в поръчката</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-white text-left">
                    <tr>
                      <th className="px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">Култура</th>
                      <th className="px-5 py-3 text-right text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">Количество</th>
                      <th className="px-5 py-3 text-right text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">Цена</th>
                      <th className="px-5 py-3 text-right text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">Сума</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {order.items.length === 0 ? (
                      <tr>
                        <td className="px-5 py-5 text-slate-600" colSpan={4}>
                          Поръчката няма редове.
                        </td>
                      </tr>
                    ) : (
                      order.items.map((item) => {
                        const lineTotal = (Number(item.quantity) * Number(item.price)).toFixed(2);

                        return (
                          <tr key={item.lineId ?? `${order.id}-${item.cropName}-${item.quantity}`} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4 text-slate-900">
                              <span className="font-semibold">{item.cropName}</span>
                              {item.cropVariety ? <span className="text-slate-500"> — {item.cropVariety}</span> : null}
                            </td>
                            <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-700">{Number(item.quantity).toFixed(2)}</td>
                            <td className="px-5 py-4 text-right tabular-nums text-slate-700">{Number(item.price).toFixed(2)} €</td>
                            <td className="px-5 py-4 text-right font-bold tabular-nums text-emerald-800">{lineTotal} €</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
