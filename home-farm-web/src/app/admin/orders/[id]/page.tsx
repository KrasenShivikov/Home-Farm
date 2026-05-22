import { getAdminOrderById } from "@/actions/admin-orders";
import AdminTabs from "@/components/admin/AdminTabs";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { formatBulgarianDate } from "@/lib/format-date";
import { getSession } from "@/lib/session";
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

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Поръчка #{order.id}</h1>
        <p className="text-sm text-gray-600">Администраторски преглед и управление на статус</p>
      </div>

      <AdminTabs active="orders" />

      <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Потребител</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{order.userName}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-slate-600">{order.userEmail}</p>
            <p className="text-sm text-slate-600">Дата: {formatBulgarianDate(order.createdAt)}</p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
            <p>Артикули: {order.totalItems}</p>
            <p>Общо: {order.totalAmount} лв</p>
          </div>
        </div>

        <OrderStatusForm orderId={order.id} status={order.status} />

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-slate-900">Данни за доставка</h3>
          <div className="mt-2 text-sm text-slate-700">
            <p>
              <strong>Град:</strong> {order.shippingCity ?? "-"}
            </p>
            <p>
              <strong>Адрес:</strong> {order.shippingStreet ?? "-"}
            </p>
            <p>
              <strong>Пощ. код:</strong> {order.shippingPostalCode ?? "-"}
            </p>
            <p>
              <strong>Държава:</strong> {order.shippingCountry ?? "-"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Култура</th>
                <th className="px-4 py-3 font-medium">Количество</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {order.items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={4}>
                    Поръчката няма редове.
                  </td>
                </tr>
              ) : (
                order.items.map((item) => {
                  const lineTotal = (Number(item.quantity) * Number(item.price)).toFixed(2);

                  return (
                    <tr key={item.lineId ?? `${order.id}-${item.cropName}-${item.quantity}`}>
                      <td className="px-4 py-3 text-slate-900">
                        {item.cropName}
                        {item.cropVariety ? <span className="text-slate-500"> — {item.cropVariety}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-700">{item.price} лв</td>
                      <td className="px-4 py-3 text-slate-700">{lineTotal} лв</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}