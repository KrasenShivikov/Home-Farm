"use client";

import Link from "next/link";

import type { UserOrder } from "@/actions/user-dashboard";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatBulgarianDate } from "@/lib/format-date";

type DashboardOrdersListProps = {
  orders: UserOrder[];
};

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

export default function DashboardOrdersList({ orders }: DashboardOrdersListProps) {
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(orders, 10);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
        Все още нямате поръчки.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pageItems.map((order) => (
        <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Поръчка #{order.id}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-slate-950">{formatBulgarianDate(order.createdAt)}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm"
            >
                Детайли
            </Link>
          </div>

          <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Артикули</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-950">{order.totalItems}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600">Общо</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">{Number(order.totalAmount).toFixed(2)} €</div>
            </div>
          </div>
        </article>
      ))}

      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={orders.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
