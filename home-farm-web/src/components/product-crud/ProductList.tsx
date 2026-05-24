"use client";

import { useMemo, useState } from "react";
import { createProductAction, deleteProductAction, updateProductAction } from "@/actions/product-actions";
import ProductCrudManager from "./ProductCrudManager";
import type { ProductRecord } from "./ProductRecordActions";

type ProductListProps = {
  initial: ProductRecord[];
};

function getProductDate(product: ProductRecord) {
  const date = new Date(product.date);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export default function ProductList({ initial }: ProductListProps) {
  const [nameTerm, setNameTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = useMemo(() => {
    const normalizedName = nameTerm.trim().toLowerCase();
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return initial.filter((product) => {
      if (normalizedName && !product.name.toLowerCase().includes(normalizedName)) {
        return false;
      }

      const productDate = getProductDate(product);
      if (productDate && start && productDate < start) {
        return false;
      }

      if (productDate && end && productDate > end) {
        return false;
      }

      return true;
    });
  }, [endDate, initial, nameTerm, startDate]);

  function resetFilters() {
    setNameTerm("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Филтри</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Търсене на продукти</h2>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            {filtered.length} от {initial.length}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Име
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => setNameTerm(event.target.value)}
              placeholder="Търси по име..."
              type="search"
              value={nameTerm}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Начална дата
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Крайна дата
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
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

      <ProductCrudManager
        products={filtered}
        createAction={createProductAction}
        updateAction={updateProductAction}
        deleteAction={deleteProductAction}
      />
    </div>
  );
}
