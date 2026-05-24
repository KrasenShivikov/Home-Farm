"use client";

import Link from "next/link";

import type { UserOrder } from "@/actions/user-dashboard";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatBulgarianDate } from "@/lib/format-date";

type DashboardOrdersListProps = {
  orders: UserOrder[];
};

export default function DashboardOrdersList({ orders }: DashboardOrdersListProps) {
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(orders, 10);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
        Нямате поръчки.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pageItems.map((order) => (
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
