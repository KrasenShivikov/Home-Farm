"use client";

import { useState } from "react";
import ActivityEditorDialog, { type ActivityFormValues } from "./ActivityEditorDialog";

export type ActivityRecord = {
  id: number;
  date: string;
  quantity: string;
  type: string;
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
  updateAction: ActionFn;
  onRequestDelete: (record: ActivityRecord) => void;
};

export default function ActivityRecordActions({
  record,
  cropId,
  label,
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
        <button className="btn btn-primary" type="button" onClick={() => onRequestDelete(record)}>
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
        onClose={() => setEditOpen(false)}
        actionFn={updateAction}
      />
    </>
  );
}