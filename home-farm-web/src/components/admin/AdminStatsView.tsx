"use client";

import { useMemo, useState } from "react";
import type { AdminStats } from "@/actions/admin-stats";
import { PaginationControls, usePagination } from "@/components/Pagination";

type AdminStatsViewProps = {
  stats: AdminStats;
  startDate: string | null;
  endDate: string | null;
  initialMainTab: MainTab;
  initialCatalogTab: CatalogTab;
};

type MainTab = "catalog" | "orders";
type CatalogTab = "summary" | "crops" | "products";
type OrdersTab = "status" | "products" | "users";

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
        <OrdersView stats={stats} startDate={startDate} endDate={endDate} />
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
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(stats.crops, 10);

  return (
    <div className="space-y-3">
      <CropStatsGroupedPanel
        cropsCount={stats.crops.length}
        onPageChange={setPage}
        page={page}
        pageCount={pageCount}
        pageItems={pageItems}
        pageSize={pageSize}
      />
      <div className="hidden">
        <CropStatsPanel
          cropsCount={stats.crops.length}
          onPageChange={setPage}
          page={page}
          pageCount={pageCount}
          pageItems={pageItems}
          pageSize={pageSize}
        />
      </div>
      <div className="hidden">
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
          {pageItems.map((c) => (
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
      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={stats.crops.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
      </div>
    </div>
  );
}

function CropStatsGroupedPanel({
  cropsCount,
  onPageChange,
  page,
  pageCount,
  pageItems,
  pageSize,
}: {
  cropsCount: number;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  pageItems: AdminStats["crops"];
  pageSize: number;
}) {
  const harvestValue = pageItems.reduce((sum, crop) => sum + Number(crop.harvestValue || 0), 0);
  const wasteValue = pageItems.reduce((sum, crop) => sum + Number(crop.wasteValue || 0), 0);
  const usedValue = pageItems.reduce((sum, crop) => sum + Number(crop.usedInProductsValue || 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Култури</p>
          <h3 className="text-lg font-semibold text-slate-900">Статистика по култури</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Реколта</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-emerald-800">{formatStatNumber(harvestValue)}</div>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-600">Загуби</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-rose-700">{formatStatNumber(wasteValue)}</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Изп. продукти</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{formatStatNumber(usedValue)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-5 pt-3 pb-2 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap" rowSpan={2}>Култура</th>
                <th className="px-5 pt-3 pb-2 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap" rowSpan={2}>Засадено</th>
                <th className="border-l border-slate-200 px-5 pt-3 pb-2 text-center text-[0.7rem] font-bold uppercase tracking-wide text-emerald-700 whitespace-nowrap" colSpan={2}>Реколта</th>
                <th className="border-l border-slate-200 px-5 pt-3 pb-2 text-center text-[0.7rem] font-bold uppercase tracking-wide text-rose-700 whitespace-nowrap" colSpan={2}>Загуби</th>
                <th className="border-l border-slate-200 px-5 pt-3 pb-2 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap" rowSpan={2}>Ср. реколта</th>
                <th className="border-l border-slate-200 px-5 pt-3 pb-2 text-center text-[0.7rem] font-bold uppercase tracking-wide text-slate-700 whitespace-nowrap" colSpan={2}>Изп. продукти</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="border-l border-slate-200 px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Количество</th>
                <th className="px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Стойност</th>
                <th className="border-l border-slate-200 px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Количество</th>
                <th className="px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Стойност</th>
                <th className="border-l border-slate-200 px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Количество</th>
                <th className="px-5 pb-3 text-left text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Стойност</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((crop) => (
                <tr key={crop.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-900">{crop.name}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.plantQty)}</td>
                  <td className="border-l border-slate-100 px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.harvestQty)}</td>
                  <td className="px-5 py-4 tabular-nums font-bold text-emerald-800">{formatStatNumber(crop.harvestValue)}</td>
                  <td className="border-l border-slate-100 px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.wasteQty)}</td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-rose-700">{formatStatNumber(crop.wasteValue)}</td>
                  <td className="border-l border-slate-100 px-5 py-4 tabular-nums text-slate-600">{crop.avgHarvestPerPlanting ? formatStatNumber(crop.avgHarvestPerPlanting) : "—"}</td>
                  <td className="border-l border-slate-100 px-5 py-4 tabular-nums font-semibold text-slate-700">{formatStatNumber(crop.usedInProductsQty)}</td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-slate-700">{formatStatNumber(crop.usedInProductsValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={cropsCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}

function CropStatsPanel({
  cropsCount,
  onPageChange,
  page,
  pageCount,
  pageItems,
  pageSize,
}: {
  cropsCount: number;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  pageItems: AdminStats["crops"];
  pageSize: number;
}) {
  const harvestValue = pageItems.reduce((sum, crop) => sum + Number(crop.harvestValue || 0), 0);
  const wasteValue = pageItems.reduce((sum, crop) => sum + Number(crop.wasteValue || 0), 0);
  const usedValue = pageItems.reduce((sum, crop) => sum + Number(crop.usedInProductsValue || 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Култури</p>
          <h3 className="text-lg font-semibold text-slate-900">Статистика по култури</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Прибрано</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{formatStatNumber(harvestValue)}</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Отпадъци</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-rose-700">{formatStatNumber(wasteValue)}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Изп. продукти</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-emerald-800">{formatStatNumber(usedValue)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                {["Култура", "Засадено", "Прибрано", "Стойност", "Отпадъци", "Стойност", "Ср. реколта", "Изп. продукти"].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((crop) => (
                <tr key={crop.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-900">{crop.name}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.plantQty)}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.harvestQty)}</td>
                  <td className="px-5 py-4 tabular-nums font-bold text-slate-900">{formatStatNumber(crop.harvestValue)}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-600">{formatStatNumber(crop.wasteQty)}</td>
                  <td className="px-5 py-4 tabular-nums text-rose-700">{formatStatNumber(crop.wasteValue)}</td>
                  <td className="px-5 py-4 tabular-nums text-slate-600">{crop.avgHarvestPerPlanting ? formatStatNumber(crop.avgHarvestPerPlanting) : "—"}</td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-emerald-700">
                    {formatStatNumber(crop.usedInProductsQty)} / {formatStatNumber(crop.usedInProductsValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={cropsCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}

function ProductTable({ stats }: { stats: AdminStats }) {
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(stats.products, 10);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] table-auto text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-4 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Продукт</th>
              <th className="px-5 py-4 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Кол-во</th>
              <th className="px-5 py-4 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Стойност</th>
              <th className="px-5 py-4 text-right text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Добавена стойност</th>
              <th className="px-5 py-4 text-left text-[0.7rem] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">Използвани култури</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.map((p) => {
              const usedCropsQty = p.usedCrops.reduce((sum, crop) => sum + Number(crop.qty || 0), 0);
              const usedCropsValue = p.usedCrops.reduce((sum, crop) => sum + Number(crop.value || 0), 0);

              return (
                <tr key={p.id} className="align-top transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-slate-600">{formatStatNumber(p.qty)}</td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold text-slate-900">{formatStatNumber(p.value)}</td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold text-emerald-700">{formatStatNumber(p.addedValue)}</td>
                  <td className="px-5 py-3">
                    {p.usedCrops.length > 0 ? (
                      <div className="min-w-[260px] rounded-xl border border-slate-200 bg-slate-50/70">
                        <div className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-3 border-b border-slate-200 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wide text-slate-400">
                          <span>Култура</span>
                          <span className="text-right">Кол-во</span>
                          <span className="text-right">Стойност</span>
                        </div>
                        <div className="divide-y divide-slate-200/70">
                          {p.usedCrops.map((uc) => (
                            <div key={uc.cropId} className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-3 px-3 py-2">
                              <span className="font-medium text-slate-700">{uc.cropName}</span>
                              <span className="text-right tabular-nums text-slate-600">{formatStatNumber(uc.qty)}</span>
                              <span className="text-right tabular-nums text-slate-600">{formatStatNumber(uc.value)}</span>
                            </div>
                          ))}
                          <div className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-3 rounded-b-xl bg-white px-3 py-2 font-semibold">
                            <span className="text-slate-900">Общо</span>
                            <span className="text-right tabular-nums text-slate-900">{formatStatNumber(usedCropsQty)}</span>
                            <span className="text-right tabular-nums text-slate-900">{formatStatNumber(usedCropsValue)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={stats.products.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

function OrdersView({
  stats,
  startDate,
  endDate,
}: {
  stats: AdminStats;
  startDate: string | null;
  endDate: string | null;
}) {
  const [ordersTab, setOrdersTab] = useState<OrdersTab>("status");
  const labels: Record<OrdersTab, string> = {
    status: "По статус",
    products: "Продукти",
    users: "По потребител",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1">
        {(["status", "products", "users"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setOrdersTab(key)}
            className={ordersTab === key
              ? "rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.22)]"
              : "rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            }
          >
            {labels[key]}
          </button>
        ))}
      </div>
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
        {stats.orders.byStatus.map((status) => (
          <div
            key={status.status}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="text-sm font-semibold text-slate-900">
              {formatOrderStatusLabel(status.status)}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                {status.ordersCount} поръчки
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-700">
                {formatStatNumber(status.totalValue)}
              </span>
            </div>
          </div>
        ))}
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
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
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
                <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
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
