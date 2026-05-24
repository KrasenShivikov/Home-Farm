"use client";

import { useMemo, useState } from "react";
import type { AdminStats } from "@/actions/admin-stats";

type AdminStatsViewProps = {
  stats: AdminStats;
  startDate: string | null;
  endDate: string | null;
  initialMainTab: MainTab;
  initialCatalogTab: CatalogTab;
};

type MainTab = "catalog" | "orders";
type CatalogTab = "summary" | "crops" | "products";

function formatStatNumber(value: string | number, fractionDigits = 2) {
  return Number(value || 0).toFixed(fractionDigits);
}

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

export default function AdminStatsView({
  stats,
  startDate,
  endDate,
  initialMainTab,
  initialCatalogTab,
}: AdminStatsViewProps) {
  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab);
  const [catalogTab, setCatalogTab] = useState<CatalogTab>(initialCatalogTab);

  const totalsChartValues = useMemo(
    () => [
      { label: "Общо производство", value: Number(stats.totals.totalProductionValue) },
      { label: "Загуби", value: Number(stats.totals.totalWastesValue) },
      { label: "Използвани култури", value: Number(stats.totals.totalUsedCropsValue) },
      { label: "Продукти", value: Number(stats.totals.totalProductsValue) },
    ],
    [stats.totals]
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5 rounded-full border border-slate-200/80 bg-white/65 p-1.5 backdrop-blur-sm w-fit">
        {(["catalog", "orders"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMainTab(key)}
            className={mainTab === key
              ? "rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)]"
              : "rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-900"
            }
          >
            {key === "catalog" ? "Култури/продукти" : "Поръчки"}
          </button>
        ))}
      </div>

      {mainTab === "catalog" ? (
        <>
          <div className="mb-5 flex flex-wrap gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1">
            {(["summary", "crops", "products"] as const).map((key) => {
              const labels = { summary: "Общо", crops: "По култури", products: "По продукти" };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCatalogTab(key)}
                  className={catalogTab === key
                    ? "rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.22)]"
                    : "rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  }
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>

          <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <input type="hidden" name="mainTab" value={mainTab} />
            <input type="hidden" name="catalogTab" value={catalogTab} />
            <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
              Начална дата
              <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" type="date" name="startDate" defaultValue={startDate ?? undefined} />
            </label>
            <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
              Крайна дата
              <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" type="date" name="endDate" defaultValue={endDate ?? undefined} />
            </label>
            <button className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(234,88,12,0.28)] transition-all hover:-translate-y-px hover:bg-orange-600" type="submit">Приложи</button>
            <a className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:shadow-sm" href="/admin/stats">Нулирай</a>
          </form>

          {catalogTab === "summary" && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Общо</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <h4 className="font-semibold mb-2">Резюме (стойности)</h4>
                  <TotalsChart values={totalsChartValues} />
                </div>
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <h4 className="font-semibold">Резюме (числа)</h4>
                  <SummaryNumbers stats={stats} />
                </div>
              </div>
            </section>
          )}

          {catalogTab === "crops" && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">По култури</h2>
              <CropTable stats={stats} />
            </section>
          )}

          {catalogTab === "products" && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">По продукти</h2>
              <ProductTable stats={stats} />
            </section>
          )}
        </>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-2">Поръчки</h2>
          <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <input type="hidden" name="mainTab" value="orders" />
            <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
              Начална дата
              <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" type="date" name="startDate" defaultValue={startDate ?? undefined} />
            </label>
            <label className="flex flex-col gap-1 text-[0.75rem] font-bold uppercase tracking-widest text-slate-400">
              Крайна дата
              <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" type="date" name="endDate" defaultValue={endDate ?? undefined} />
            </label>
            <button className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(234,88,12,0.28)] transition-all hover:-translate-y-px hover:bg-orange-600" type="submit">Приложи</button>
            <a className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:shadow-sm" href="/admin/stats?mainTab=orders">Нулирай</a>
          </form>
          <OrdersView stats={stats} />
        </section>
      )}
    </div>
  );
}

function TotalsChart({ values }: { values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map((v) => v.value), 1);

  return (
    <svg width="100%" height={values.length * 28} viewBox={`0 0 600 ${values.length * 28}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const w = (v.value / max) * 560;
        return (
          <g key={v.label} transform={`translate(0, ${i * 28})`}>
            <text x={0} y={14} fontSize={12} fill="#0f172a">{v.label}</text>
            <rect x={120} y={4} width={w} height={20} fill="#0ea5ff" rx={4} />
            <text x={120 + w + 8} y={18} fontSize={12} fill="#0f172a">{v.value.toFixed(2)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SummaryNumbers({ stats }: { stats: AdminStats }) {
  const rows: { label: string; qty: string; value: string; highlight?: boolean }[] = [
    { label: "Общо производство", qty: stats.totals.totalProductionQty, value: stats.totals.totalProductionValue },
    { label: "Загуби", qty: stats.totals.totalWastesQty, value: stats.totals.totalWastesValue },
    { label: "Използвани култури", qty: stats.totals.totalUsedCropsQty, value: stats.totals.totalUsedCropsValue },
    { label: "Продукти", qty: stats.totals.totalProductsQty, value: stats.totals.totalProductsValue },
    { label: "Добавена стойност", qty: "", value: stats.totals.totalProductAddedValue },
  ];

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-2 pr-4 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Показател</th>
            <th className="pb-2 px-4 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Количество</th>
            <th className="pb-2 pl-4 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">Стойност</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.label} className="transition-colors hover:bg-slate-50/60">
              <td className="py-2.5 pr-4 text-sm text-slate-600">{r.label}</td>
              <td className="py-2.5 px-4 text-right text-sm font-semibold tabular-nums text-slate-900">{r.qty ? formatStatNumber(r.qty) : "—"}</td>
              <td className="py-2.5 pl-4 text-right text-sm font-semibold tabular-nums text-slate-900">{formatStatNumber(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
        <span className="text-sm font-semibold text-emerald-800">Крайна обща стойност</span>
        <span className="text-lg font-extrabold tabular-nums text-emerald-800">{formatStatNumber(stats.totals.endTotalValue)}</span>
      </div>
    </div>
  );
}

function CropTable({ stats }: { stats: AdminStats }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {["Култура", "Засадено", "Прибрано (кол-во)", "Прибрано (стойност)", "Отпадъци (кол-во)", "Отпадъци (стойност)", "Ср. реколта", "Изп. за продукти"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stats.crops.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
              <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(c.plantQty)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(c.harvestQty)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-700 font-medium">{formatStatNumber(c.harvestValue)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(c.wasteQty)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(c.wasteValue)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.avgHarvestPerPlanting ? formatStatNumber(c.avgHarvestPerPlanting) : "—"}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(c.usedInProductsQty)} / {formatStatNumber(c.usedInProductsValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({ stats }: { stats: AdminStats }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {["Продукт", "Кол-во", "Стойност", "Разходи за култури", "Добавена стойност", "Използвани култури"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stats.products.map((p) => (
            <tr key={p.id} className="align-top transition-colors hover:bg-slate-50/60">
              <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(p.qty)}</td>
              <td className="px-4 py-3 tabular-nums font-medium text-slate-700">{formatStatNumber(p.value)}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{formatStatNumber(p.cropsValueSum)}</td>
              <td className="px-4 py-3 tabular-nums font-medium text-emerald-700">{formatStatNumber(p.addedValue)}</td>
              <td className="px-4 py-3">
                <ul className="space-y-0.5 text-xs text-slate-500">
                  {p.usedCrops.map((uc) => (
                    <li key={uc.cropId} className="flex gap-1"><span className="font-medium text-slate-700">{uc.cropName}:</span> {formatStatNumber(uc.qty)} <span className="text-slate-400">({formatStatNumber(uc.value)})</span></li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersView({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
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
      <OrdersProductsView stats={stats} />
      <OrdersByUserView stats={stats} />
    </div>
  );
}

function OrdersProductsView({ stats }: { stats: AdminStats }) {
  const totalQuantity = stats.orders.products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );
  const totalValue = stats.orders.products.reduce(
    (sum, product) => sum + Number(product.value || 0),
    0
  );

  return (
    <section>
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
              stats.orders.products.map((product) => (
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
    </section>
  );
}

function OrdersByUserView({ stats }: { stats: AdminStats }) {
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {stats.orders.byUser.map((user) => (
          <article key={user.userId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <div>
                <h4 className="font-semibold text-slate-900">{user.userName}</h4>
                <p className="text-xs text-slate-500">#{user.userId}</p>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
                  {user.ordersCount} поръчки
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  {formatStatNumber(user.totalValue)}
                </span>
              </div>
            </div>

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
                      {formatStatNumber(user.products.reduce((sum, product) => sum + Number(product.quantity || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatStatNumber(user.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
