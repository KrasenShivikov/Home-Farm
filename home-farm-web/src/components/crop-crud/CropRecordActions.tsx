"use client";

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
        <button className="btn btn-primary" type="button" onClick={() => onRequestDelete(crop)}>
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