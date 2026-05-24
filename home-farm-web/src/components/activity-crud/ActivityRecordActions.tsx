"use client";

import { useState } from "react";
import ActivityEditorDialog, { type ActivityFormValues } from "./ActivityEditorDialog";

export type ActivityRecord = {
  id: number;
  date: string;
  quantity: string;
  type?: string;
  description: string | null;
};

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type ActivityRecordActionsProps = {
  record: ActivityRecord;
  cropId: number;
  label: string;
  showQuantity?: boolean;
  showType?: boolean;
  updateAction: ActionFn;
  onRequestDelete: (record: ActivityRecord) => void;
};

export default function ActivityRecordActions({
  record,
  cropId,
  label,
  showQuantity = false,
  showType = false,
  updateAction,
  onRequestDelete,
}: ActivityRecordActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const values: ActivityFormValues = {
    id: record.id,
    date: record.date,
    quantity: record.quantity,
    type: record.type,
    description: record.description,
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          className="inline-flex min-w-32 items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-emerald-300 hover:text-emerald-800 hover:shadow-sm"
          type="button"
          onClick={() => {
            setEditSession((value) => value + 1);
            setEditOpen(true);
          }}
        >
          Редактирай
        </button>
        <button className="inline-flex min-w-28 items-center justify-center rounded-full bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(225,29,72,0.22)] transition-all hover:-translate-y-px hover:bg-rose-700" type="button" onClick={() => onRequestDelete(record)}>
          Изтрий
        </button>
      </div>

      <ActivityEditorDialog
        key={`${record.id}-${editSession}`}
        open={editOpen}
        mode="edit"
        cropId={cropId}
        values={values}
        title={label}
        showQuantity={showQuantity}
        showType={showType}
        onClose={() => setEditOpen(false)}
        actionFn={updateAction}
      />
    </>
  );
}
