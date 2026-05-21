"use client";

import Link from "next/link";
import { useState } from "react";
import ProductEditorDialog, { type ProductFormValues } from "./ProductEditorDialog";

export type ProductRecord = {
  id: number;
  name: string;
  date: string;
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
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link className="btn" href={`/admin/products/${product.id}`}>
          Детайли
        </Link>
        <button
          className="btn"
          type="button"
          onClick={() => {
            setEditSession((value) => value + 1);
            setEditOpen(true);
          }}
        >
          Редактирай
        </button>
        <button className="btn btn-primary" type="button" onClick={() => onRequestDelete(product)}>
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