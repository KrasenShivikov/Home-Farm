"use client";

import Link from "next/link";
import { useState } from "react";
import CropEditorDialog, { type CropFormValues } from "./CropEditorDialog";

export type CropRecord = {
  id: number;
  name: string;
  variety: string | null;
  forSale: boolean;
  price: string | null;
  description: string | null;
};

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type CropRecordActionsProps = {
  crop: CropRecord;
  onRequestDelete: (crop: CropRecord) => void;
  updateAction: ActionFn;
};

export default function CropRecordActions({ crop, onRequestDelete, updateAction }: CropRecordActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const values: CropFormValues = {
    id: crop.id,
    name: crop.name,
    variety: crop.variety,
    forSale: crop.forSale,
    price: crop.price,
    description: crop.description,
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm" href={`/admin/crop/${crop.id}`}>
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
        <button className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(225,29,72,0.24)] transition-all hover:-translate-y-px hover:bg-rose-700" type="button" onClick={() => onRequestDelete(crop)}>
          Изтрий
        </button>
      </div>

      <CropEditorDialog
        key={`${crop.id}-${editSession}`}
        open={editOpen}
        mode="edit"
        values={values}
        title="култура"
        onClose={() => setEditOpen(false)}
        actionFn={updateAction}
      />
    </>
  );
}
