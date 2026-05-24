"use client";

import { useState, useMemo } from "react";
import CropCrudManager from "./crop-crud/CropCrudManager";
import { createCropAction, deleteCropAction, updateCropAction } from "@/actions/crop-actions";

type CropListItem = {
  id: number;
  name: string;
  variety: string | null;
  forSale: boolean;
  price: string | null;
  description: string | null;
  date?: string | Date | null;
  createdAt?: string | Date | null;
};

type SaleFilter = "all" | "sale" | "not-sale";

export default function CropList({ initial }: { initial: CropListItem[] }) {
  const [nameTerm, setNameTerm] = useState("");
  const [saleFilter, setSaleFilter] = useState<SaleFilter>("all");

  const filtered = useMemo(() => {
    const normalizedName = nameTerm.trim().toLowerCase();

    return initial.filter((crop) => {
      const searchableText = `${crop.name} ${crop.variety ?? ""}`.toLowerCase();
      if (normalizedName && !searchableText.includes(normalizedName)) {
        return false;
      }

      if (saleFilter === "sale" && !crop.forSale) {
        return false;
      }

      if (saleFilter === "not-sale" && crop.forSale) {
        return false;
      }

      return true;
    });
  }, [initial, nameTerm, saleFilter]);

  function resetFilters() {
    setNameTerm("");
    setSaleFilter("all");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Филтри</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Търсене на култури</h2>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            {filtered.length} от {initial.length}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(10rem,0.8fr)_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Име
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => setNameTerm(event.target.value)}
              placeholder="Търси по име или сорт..."
              type="search"
              value={nameTerm}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Продажба
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => setSaleFilter(event.target.value as SaleFilter)}
              value={saleFilter}
            >
              <option value="all">Всички</option>
              <option value="sale">За продажба</option>
              <option value="not-sale">Не се продава</option>
            </select>
          </label>

          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm"
            onClick={resetFilters}
            type="button"
          >
            Нулирай
          </button>
        </div>
      </section>
      <CropCrudManager crops={filtered} createAction={createCropAction} updateAction={updateCropAction} deleteAction={deleteCropAction} />
    </div>
  );
}
