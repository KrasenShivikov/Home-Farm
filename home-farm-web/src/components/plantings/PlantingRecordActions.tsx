"use client";

import { useState } from "react";
import PlantingEditorDialog from "./PlantingEditorDialog";

export type PlantingRecord = {
  id: number;
  date: string;
  quantity: string;
  description: string | null;
};

type PlantingRecordActionsProps = {
  planting: PlantingRecord;
  cropId: number;
  onRequestDelete: (planting: PlantingRecord) => void;
};

export default function PlantingRecordActions({ planting, cropId, onRequestDelete }: PlantingRecordActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

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
        <button className="btn btn-primary" type="button" onClick={() => onRequestDelete(planting)}>
          Изтрий
        </button>
      </div>

      <PlantingEditorDialog
        key={`${planting.id}-${editSession}`}
        open={editOpen}
        mode="edit"
        cropId={cropId}
        values={planting}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}