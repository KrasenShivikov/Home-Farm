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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Продукти</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте продуктите директно от отделната продуктовата страница.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 hover:bg-orange-600" type="button" onClick={() => setCreateOpen(true)}>
          Добави продукт
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {products.length === 0 && <div className="text-sm text-slate-600">Няма продукти.</div>}

        {pageItems.map((product) => (
          <article key={product.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-600">{formatBulgarianDate(product.date)}</p>
                <p className="text-sm text-slate-600">Количество: {product.quantity}</p>
                <p className="text-sm text-slate-600">Цена: {product.price ?? "—"}</p>
              </div>

              <ProductRecordActions
                product={product}
                onRequestDelete={(selectedProduct) => setDeleteTarget(selectedProduct)}
                updateAction={updateAction}
              />
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
