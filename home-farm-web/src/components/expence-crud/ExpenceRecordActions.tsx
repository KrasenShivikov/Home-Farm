"use client";

import type { ExpenceRecord, ExpenceTypeOption } from "@/actions/expence-actions";
import { useState } from "react";
import ExpenceEditorDialog, { type ExpenceFormValues } from "./ExpenceEditorDialog";

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type ExpenceRecordActionsProps = {
  expence: ExpenceRecord;
  types: ExpenceTypeOption[];
  onRequestDelete: (expence: ExpenceRecord) => void;
  updateAction: ActionFn;
};

export default function ExpenceRecordActions({
  expence,
  types,
  onRequestDelete,
  updateAction,
}: ExpenceRecordActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const values: ExpenceFormValues = {
    id: expence.id,
    name: expence.name,
    expencesTypeId: expence.expencesTypeId,
    date: expence.date,
    value: expence.value ?? "",
    description: expence.description ?? "",
  };

  return (
    <>
      <div className="flex justify-end gap-2">
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
        <button
          className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(225,29,72,0.25)] transition-all hover:-translate-y-px hover:bg-rose-700"
          type="button"
          onClick={() => onRequestDelete(expence)}
        >
          Изтрий
        </button>
      </div>

      <ExpenceEditorDialog
        key={`${expence.id}-${editSession}`}
        open={editOpen}
        mode="edit"
        values={values}
        types={types}
        title="разход"
        onClose={() => setEditOpen(false)}
        actionFn={updateAction}
      />
    </>
  );
}
