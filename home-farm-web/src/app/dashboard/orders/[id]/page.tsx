import { getOrderableCrops, getUserOrderById } from "@/actions/user-dashboard";
import OrderDetailActions from "@/components/dashboard/OrderDetailActions";
import OrderLinesManager from "@/components/dashboard/OrderLinesManager";
import OrderShippingForm from "@/components/dashboard/OrderShippingForm";
import { formatBulgarianDate } from "@/lib/format-date";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusStyles: Record<string, string> = {
  Pending: "border-amber-200 bg-amber-100 text-amber-900",
  Accepted: "border-sky-200 bg-sky-100 text-sky-900",
  Completed: "border-emerald-200 bg-emerald-100 text-emerald-900",
  Cancelled: "border-rose-200 bg-rose-100 text-rose-900",
};

function formatOrderStatusLabel(status: string) {
  switch (status) {
    case "Pending":
      return "Чакаща";
    case "Accepted":
      return "Приета";
    case "Completed":
      return "Завършена";
    case "Cancelled":
      return "Отказана";
    default:
      return status;
  }
}

function OrderStatusBadge({ status }: { status: string }) {
  const className = statusStyles[status] ?? "border-slate-200 bg-slate-100 text-slate-800";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${className}`}>
      {formatOrderStatusLabel(status)}
    </span>
  );
}

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

  const canEdit = order.status === "Pending";

  return (
    <section className="container py-10">
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Детайли за поръчка</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-950">Поръчка #{order.id}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{formatBulgarianDate(order.createdAt)}</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm">
            Назад към таблото
          </Link>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Артикули</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-slate-950">{order.totalItems}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600">Общо</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-900">{Number(order.totalAmount).toFixed(2)} €</div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-600">Статус</div>
            <div className="mt-1 text-2xl font-extrabold text-amber-900">{formatOrderStatusLabel(order.status)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <OrderLinesManager orderId={order.id} orderStatus={order.status} items={order.items} crops={orderableCrops} />
        </div>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Доставка</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Адрес</h2>
            </div>
            <OrderShippingForm
              canEdit={canEdit}
              orderId={order.id}
              shippingCity={order.shippingCity}
              shippingStreet={order.shippingStreet}
              shippingPostalCode={order.shippingPostalCode}
              shippingCountry={order.shippingCountry}
            />
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Действия</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Управление</h2>
            </div>
            <div className="p-5">
              <OrderDetailActions orderId={order.id} status={order.status} />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
