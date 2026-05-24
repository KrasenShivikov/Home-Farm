"use client";

import { useState } from "react";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatBulgarianDate } from "@/lib/format-date";
import ProductEditorDialog, { type ProductFormValues } from "./ProductEditorDialog";
import ProductRecordActions, { type ProductRecord } from "./ProductRecordActions";
import ProductDeleteDialog from "./ProductDeleteDialog";

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type DeleteActionFn = (formData: FormData) => Promise<{ error?: string; success?: string }>;

type ProductCrudManagerProps = {
  products: ProductRecord[];
  createAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: DeleteActionFn;
};

export default function ProductCrudManager({ products, createAction, updateAction, deleteAction }: ProductCrudManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(products, 6);

  const createValues: ProductFormValues = {
    name: "",
    date: "",
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Продукти</p>
          <h2 className="text-2xl font-bold text-slate-950">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте продуктите директно от продуктовата страница.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,0.28)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700" type="button" onClick={() => setCreateOpen(true)}>
          Добави продукт
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
          Няма продукти.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {pageItems.map((product) => (
          <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold text-slate-950">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{formatBulgarianDate(product.date)}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                  Продукт
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Количество</div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-slate-950">{Number(product.quantity || 0).toFixed(3)}</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600">Цена</div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-emerald-900">
                      {product.price ? `${Number(product.price).toFixed(2)} €` : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Обща стойност</div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-slate-950">
                      {product.price ? `${(Number(product.quantity || 0) * Number(product.price)).toFixed(2)} €` : "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-700">ID</div>
                    <div className="text-sm font-bold tabular-nums text-emerald-900">#{product.id}</div>
                  </div>
                </div>

                <ProductRecordActions
                  product={product}
                  onRequestDelete={(selectedProduct) => setDeleteTarget(selectedProduct)}
                  updateAction={updateAction}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={products.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <ProductEditorDialog
        open={createOpen}
        mode="create"
        values={createValues}
        title="продукт"
        onClose={() => setCreateOpen(false)}
        actionFn={createAction}
      />

      <ProductDeleteDialog
        open={Boolean(deleteTarget)}
        productId={deleteTarget?.id ?? null}
        title={deleteTarget ? deleteTarget.name : ""}
        onClose={() => setDeleteTarget(null)}
        deleteAction={deleteAction}
      />
    </section>
  );
}
