import { getOrderableCrops, getUserOrderById } from "@/actions/user-dashboard";
import OrderLinesManager from "@/components/dashboard/OrderLinesManager";
import OrderDetailActions from "@/components/dashboard/OrderDetailActions";
import { getSession } from "@/lib/session";
import { formatBulgarianDate } from "@/lib/format-date";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id: idParam } = await params;
  const orderId = Number(idParam);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <div className="container py-10">Невалидна поръчка.</div>;
  }

  const order = await getUserOrderById(session.userId, orderId);
  const orderableCrops = await getOrderableCrops();

  if (!order) {
    return <div className="container py-10">Поръчката не е намерена.</div>;
  }

  return (
    <section className="container py-10">
      <div className="mb-6 space-y-2">
        <p className="eyebrow">Детайли за поръчка</p>
        <h1 className="text-3xl font-bold text-slate-900">Поръчка #{order.id}</h1>
        <p className="text-sm text-slate-600">Статус: {order.status}</p>
        <p className="text-sm text-slate-600">Дата: {formatBulgarianDate(order.createdAt)}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="btn">
          Назад към таблото
        </Link>
      </div>

      <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Поръчка #{order.id}</p>
            <h2 className="text-xl font-semibold text-slate-900">{order.status}</h2>
            <p className="text-sm text-slate-600">Дата: {formatBulgarianDate(order.createdAt)}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Артикули: {order.totalItems}</p>
            <p>Общо: {order.totalAmount} лв</p>
          </div>
        </div>

        <OrderLinesManager orderId={order.id} orderStatus={order.status} items={order.items} crops={orderableCrops} />

        <OrderDetailActions orderId={order.id} status={order.status} />
      </div>
    </section>
  );
}
