"use client";

import Link from "next/link";
import { useState } from "react";
import ProductEditorDialog, { type ProductFormValues } from "./ProductEditorDialog";

export type ProductRecord = {
  id: number;
  name: string;
  date: string;
  quantity: string;
  price: string | null;
};

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type ProductRecordActionsProps = {
  product: ProductRecord;
  onRequestDelete: (product: ProductRecord) => void;
  updateAction: ActionFn;
};

export default function ProductRecordActions({ product, onRequestDelete, updateAction }: ProductRecordActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const values: ProductFormValues = {
    id: product.id,
    name: product.name,
    date: product.date,
    quantity: product.quantity,
    price: product.price ?? "",
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm" href={`/admin/products/${product.id}`}>
          Детайли
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm"
          type="button"
          onClick={() => {
            setEditSession((value) => value + 1);
            setEditOpen(true);
          }}
        >
          Редактирай
        </button>
        <button className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(225,29,72,0.24)] transition-all hover:-translate-y-px hover:bg-rose-700" type="button" onClick={() => onRequestDelete(product)}>
          Изтрий
        </button>
      </div>

      <ProductEditorDialog
        key={`${product.id}-${editSession}`}
        open={editOpen}
        mode="edit"
        values={values}
        title="продукт"
        onClose={() => setEditOpen(false)}
        actionFn={updateAction}
      />
    </>
  );
}
