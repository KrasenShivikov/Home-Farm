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
      <div className="flex flex-wrap gap-2">
        <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:bg-white hover:shadow-sm" href={`/admin/products/${product.id}`}>
          Детайли
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:bg-white hover:shadow-sm"
          type="button"
          onClick={() => {
            setEditSession((value) => value + 1);
            setEditOpen(true);
          }}
        >
          Редактирай
        </button>
        <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)] transition-all hover:-translate-y-px hover:bg-orange-600" type="button" onClick={() => onRequestDelete(product)}>
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