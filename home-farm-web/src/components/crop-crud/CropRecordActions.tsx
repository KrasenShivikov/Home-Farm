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
      <div className="flex flex-wrap gap-2">
        <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:bg-white hover:shadow-sm" href={`/admin/crop/${crop.id}`}>
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
        <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)] transition-all hover:-translate-y-px hover:bg-orange-600" type="button" onClick={() => onRequestDelete(crop)}>
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