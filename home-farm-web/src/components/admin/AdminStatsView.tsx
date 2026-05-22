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
  const rows: [string, string][] = [
    ["Общо производство кол-во", stats.totals.totalProductionQty],
    ["Общо производство стойност", stats.totals.totalProductionValue],
    ["Отпадъци кол-во", stats.totals.totalWastesQty],
    ["Отпадъци стойност", stats.totals.totalWastesValue],
    ["Изп. култури кол-во", stats.totals.totalUsedCropsQty],
    ["Изп. култури стойност", stats.totals.totalUsedCropsValue],
    ["Продукти кол-во", stats.totals.totalProductsQty],
    ["Продукти стойност", stats.totals.totalProductsValue],
    ["Добавена стойност на продукти", stats.totals.totalProductAddedValue],
  ];
  return (
    <div className="mt-2 divide-y divide-slate-100">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-sm font-bold tabular-nums text-slate-900">{value}</span>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3">
        <span className="text-sm font-semibold text-emerald-800">Крайна обща стойност</span>
        <span className="text-lg font-extrabold tabular-nums text-emerald-800">{stats.totals.endTotalValue}</span>
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
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.plantQty}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.harvestQty}</td>
              <td className="px-4 py-3 tabular-nums text-slate-700 font-medium">{c.harvestValue}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.wasteQty}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.wasteValue}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.avgHarvestPerPlanting ?? "—"}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{c.usedInProductsQty} / {c.usedInProductsValue}</td>
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
              <td className="px-4 py-3 tabular-nums text-slate-600">{p.qty}</td>
              <td className="px-4 py-3 tabular-nums font-medium text-slate-700">{p.value}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{p.cropsValueSum}</td>
              <td className="px-4 py-3 tabular-nums font-medium text-emerald-700">{p.addedValue}</td>
              <td className="px-4 py-3">
                <ul className="space-y-0.5 text-xs text-slate-500">
                  {p.usedCrops.map((uc) => (
                    <li key={uc.cropId} className="flex gap-1"><span className="font-medium text-slate-700">{uc.cropName}:</span> {uc.qty} <span className="text-slate-400">({uc.value})</span></li>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article className="rounded-2xl border bg-white p-4 shadow-sm">
        <h4 className="font-semibold">По статус</h4>
        <ul className="text-sm list-disc pl-5 mt-2">
          {stats.orders.byStatus.map((s) => (
            <li key={s.status}>{s.status}: {s.ordersCount} поръчки — {s.totalValue}</li>
          ))}
        </ul>
      </article>
      <article className="rounded-2xl border bg-white p-4 shadow-sm">
        <h4 className="font-semibold">Поръчкови редове</h4>
        <div className="text-sm text-slate-600">Общо количество: {stats.orders.orderLines.totalQty}</div>
        <div className="text-sm text-slate-600">Обща стойност: {stats.orders.orderLines.totalValue}</div>
      </article>
    </div>
  );
}