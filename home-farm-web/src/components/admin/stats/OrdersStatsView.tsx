"use client";

import { useState } from "react";
import type { AdminStats } from "@/actions/admin-stats";
import { PaginationControls, usePagination } from "@/components/Pagination";

import { formatOrderStatusLabel, formatStatNumber, getOrderStatusStatsClasses } from "./shared";
import type { OrdersTab } from "./types";

export function OrdersView({
  stats,
  startDate,
  endDate,
  initialOrdersTab,
}: {
  stats: AdminStats;
  startDate: string | null;
  endDate: string | null;
  initialOrdersTab: OrdersTab;
}) {
  const [ordersTab, setOrdersTab] = useState<OrdersTab>(initialOrdersTab);
  const labels: Record<OrdersTab, string> = {
    status: "По статус",
    products: "Продукти",
    users: "По потребител",
  };

  return (
    <div className="space-y-4">
      <div className="flex w-fit flex-wrap gap-1.5 rounded-full border border-emerald-900/10 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm">
        {(["status", "products", "users"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setOrdersTab(key)}
            className={ordersTab === key
              ? "rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(5,150,105,0.24)]"
              : "rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/85 hover:text-slate-900"
            }
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <input type="hidden" name="mainTab" value="orders" />
        <input type="hidden" name="ordersTab" value={ordersTab} />
        <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
          Начална дата
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" type="date" name="startDate" defaultValue={startDate ?? undefined} />
        </label>
        <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
          Крайна дата
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" type="date" name="endDate" defaultValue={endDate ?? undefined} />
        </label>
        <button className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.28)] transition-all hover:-translate-y-px hover:bg-emerald-700" type="submit">Приложи</button>
        <a className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:shadow-sm" href={`/admin/stats?mainTab=orders&ordersTab=${ordersTab}`}>Нулирай</a>
      </form>
      {ordersTab === "status" ? (
      <>
      <OrdersStatusPanel stats={stats} />
      <div className="hidden">
        <article className="rounded-2xl border bg-white p-4 shadow-sm">
          <h4 className="font-semibold">По статус</h4>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {stats.orders.byStatus.map((s) => (
              <li key={s.status}>
                {formatOrderStatusLabel(s.status)}: {s.ordersCount} поръчки - {formatStatNumber(s.totalValue)}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              Общо количество: <span className="font-semibold tabular-nums text-slate-900">{formatStatNumber(stats.orders.orderLines.totalQty)}</span>
            </div>
            <div>
              Обща стойност: <span className="font-semibold tabular-nums text-slate-900">{formatStatNumber(stats.orders.orderLines.totalValue)}</span>
            </div>
          </div>
        </article>
      </div>
      </>
      ) : null}
      {ordersTab === "products" ? <OrdersProductsView stats={stats} /> : null}
      {ordersTab === "users" ? <OrdersByUserView stats={stats} /> : null}
    </div>
  );
}

function OrdersStatusPanel({ stats }: { stats: AdminStats }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <h4 className="font-semibold text-slate-900">По статус</h4>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-3">
        {stats.orders.byStatus.map((status) => {
          const statusClasses = getOrderStatusStatsClasses(status.status);

          return (
            <div
              key={status.status}
              className={`rounded-2xl border px-4 py-3 shadow-sm ${statusClasses.card}`}
            >
              <div className={`text-sm font-semibold ${statusClasses.title}`}>
                {formatOrderStatusLabel(status.status)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusClasses.pill}`}>
                  {status.ordersCount} поръчки
                </span>
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold tabular-nums ${statusClasses.pill}`}>
                  {formatStatNumber(status.totalValue)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 p-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Общо количество
          </div>
          <div className="mt-1 text-xl font-bold tabular-nums text-slate-900">
            {formatStatNumber(stats.orders.orderLines.totalQty)}
          </div>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Обща стойност
          </div>
          <div className="mt-1 text-xl font-bold tabular-nums text-emerald-700">
            {formatStatNumber(stats.orders.orderLines.totalValue)}
          </div>
        </div>
      </div>
    </article>
  );
}

function OrdersProductsView({ stats }: { stats: AdminStats }) {
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(
    stats.orders.products,
    10
  );
  const totalQuantity = stats.orders.products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );
  const totalValue = stats.orders.products.reduce(
    (sum, product) => sum + Number(product.value || 0),
    0
  );

  return (
    <section className="space-y-4">
      <OrdersProductsPanel
        page={page}
        pageCount={pageCount}
        pageItems={pageItems}
        pageSize={pageSize}
        productsCount={stats.orders.products.length}
        totalQuantity={totalQuantity}
        totalValue={totalValue}
        onPageChange={setPage}
      />
      <div className="hidden">
      <h3 className="mb-3 text-lg font-semibold">Всички поръчани продукти</h3>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Продукт</th>
              <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Количество</th>
              <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Стойност</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.orders.products.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-sm text-slate-500" colSpan={3}>Няма продукти.</td>
              </tr>
            ) : (
              pageItems.map((product) => (
                <tr key={product.productId} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{product.productName}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatStatNumber(product.quantity)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">{formatStatNumber(product.value)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50/80">
              <td className="px-4 py-3 font-semibold text-slate-900">Общо</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{formatStatNumber(totalQuantity)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatStatNumber(totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-3">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          totalItems={stats.orders.products.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
      </div>
    </section>
  );
}

function OrdersProductsPanel({
  page,
  pageCount,
  pageItems,
  pageSize,
  productsCount,
  totalQuantity,
  totalValue,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  pageItems: AdminStats["orders"]["products"];
  pageSize: number;
  productsCount: number;
  totalQuantity: number;
  totalValue: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Продукти</p>
          <h3 className="text-lg font-semibold text-slate-900">Всички поръчани продукти</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Количество</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{formatStatNumber(totalQuantity)}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Стойност</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-emerald-800">{formatStatNumber(totalValue)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-5 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Продукт</th>
                <th className="px-5 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Количество</th>
                <th className="px-5 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Стойност</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productsCount === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-sm text-slate-500" colSpan={3}>Няма продукти.</td>
                </tr>
              ) : (
                pageItems.map((product) => (
                  <tr key={product.productId} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-slate-900">{product.productName}</td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-600">{formatStatNumber(product.quantity)}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-bold text-slate-900">{formatStatNumber(product.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/80">
                <td className="px-5 py-4 font-bold text-slate-900">Общо</td>
                <td className="px-5 py-4 text-right tabular-nums font-bold text-slate-900">{formatStatNumber(totalQuantity)}</td>
                <td className="px-5 py-4 text-right tabular-nums font-bold text-emerald-700">{formatStatNumber(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={productsCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}

function OrdersByUserView({ stats }: { stats: AdminStats }) {
  const [userSearch, setUserSearch] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<number>>(new Set());
  const normalizedSearch = userSearch.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? stats.orders.byUser.filter((user) =>
        `${user.userName} ${user.userId}`.toLowerCase().includes(normalizedSearch)
      )
    : stats.orders.byUser;
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(filteredUsers, 10);

  function toggleUser(userId: number) {
    setExpandedUserIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  if (stats.orders.byUser.length === 0) {
    return (
      <section>
        <h3 className="mb-3 text-lg font-semibold">По потребител</h3>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Няма поръчки.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">По потребител</h3>
      <label className="mb-3 flex min-w-64 max-w-sm flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
        Търсене
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          onChange={(event) => setUserSearch(event.target.value)}
          placeholder="Име или номер"
          type="search"
          value={userSearch}
        />
      </label>
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Няма потребители за това търсене.
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4">
        {pageItems.map((user) => {
          const isExpanded = expandedUserIds.has(user.userId);
          const totalQuantity = user.products.reduce(
            (sum, product) => sum + Number(product.quantity || 0),
            0
          );

          return (
          <article key={user.userId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              aria-expanded={isExpanded}
              className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-left transition-colors hover:bg-slate-100/80"
              onClick={() => toggleUser(user.userId)}
              type="button"
            >
              <div>
                <h4 className="font-semibold text-slate-900">{user.userName}</h4>
                <p className="text-xs text-slate-500">#{user.userId}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  {user.ordersCount} поръчки
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {formatStatNumber(totalQuantity)}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  {formatStatNumber(user.totalValue)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {isExpanded ? "Скрий" : "Покажи"}
                </span>
              </div>
            </button>

            {isExpanded ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-2 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Продукт</th>
                    <th className="px-4 py-2 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Количество</th>
                    <th className="px-4 py-2 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Стойност</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.products.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-500" colSpan={3}>Няма продукти.</td>
                    </tr>
                  ) : (
                    user.products.map((product) => (
                      <tr key={product.productId} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{product.productName}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatStatNumber(product.quantity)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">{formatStatNumber(product.value)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">Общо</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">
                      {formatStatNumber(totalQuantity)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatStatNumber(user.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            ) : null}
          </article>
          );
        })}
      </div>
      <div className="mt-3">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}

