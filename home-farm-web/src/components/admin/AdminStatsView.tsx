"use client";

import { useState } from "react";

import { CatalogStatsView } from "./stats/CatalogStatsView";
import { OrdersView } from "./stats/OrdersStatsView";
import type { AdminStatsViewProps, MainTab } from "./stats/types";

export default function AdminStatsView({
  stats,
  startDate,
  endDate,
  initialMainTab,
  initialCatalogTab,
  initialOrdersTab,
}: AdminStatsViewProps) {
  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab);

  return (
    <div>
      <div className="mb-5 flex w-fit flex-wrap gap-1.5 rounded-full border border-emerald-900/10 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm">
        {(["catalog", "orders"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMainTab(key)}
            className={mainTab === key
              ? "rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(5,150,105,0.24)]"
              : "rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/85 hover:text-slate-900"
            }
          >
            {key === "catalog" ? "Култури/продукти" : "Поръчки"}
          </button>
        ))}
      </div>

      {mainTab === "catalog" ? (
        <CatalogStatsView
          stats={stats}
          startDate={startDate}
          endDate={endDate}
          initialCatalogTab={initialCatalogTab}
        />
      ) : (
        <OrdersView
          stats={stats}
          startDate={startDate}
          endDate={endDate}
          initialOrdersTab={initialOrdersTab}
        />
      )}
    </div>
  );
}
