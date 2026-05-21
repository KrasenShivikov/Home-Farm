"use client";

import { useState } from "react";
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

  const createValues: ProductFormValues = {
    name: "",
    date: "",
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Продукти</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте продуктите директно от отделната продуктовата страница.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setCreateOpen(true)}>
          Добави продукт
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {products.length === 0 && <div className="text-sm text-slate-600">Няма продукти.</div>}

        {products.map((product) => (
          <article key={product.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-600">{formatBulgarianDate(product.date)}</p>
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