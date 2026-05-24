"use client";

import Link from "next/link";

import type { AdminOrder } from "@/actions/admin-orders";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatBulgarianDate } from "@/lib/format-date";

import OrderStatusBadge from "./OrderStatusBadge";

type AdminOrdersListProps = {
  orders: AdminOrder[];
};

export default function AdminOrdersList({ orders }: AdminOrdersListProps) {
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(orders, 10);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
        Няма поръчки.
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
                <h2 className="truncate text-xl font-bold text-slate-950">{order.userName}</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{order.userEmail}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                {formatBulgarianDate(order.createdAt)}
              </span>
              <Link
                href={`/admin/orders/${order.id}`}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700"
              >
                Детайли
              </Link>
            </div>
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
