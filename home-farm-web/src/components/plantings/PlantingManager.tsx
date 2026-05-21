"use client";

import { useState } from "react";
import PlantingEditorDialog from "./PlantingEditorDialog";
import PlantingRecordActions, { type PlantingRecord } from "./PlantingRecordActions";
import PlantingDeleteDialog from "./PlantingDeleteDialog";
import { formatBulgarianDate } from "@/lib/format-date";

type PlantingManagerProps = {
  plantings: PlantingRecord[];
  cropId: number;
};

export default function PlantingManager({ plantings, cropId }: PlantingManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PlantingRecord | null>(null);

  return (
    <section className="mt-10 space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Посеви</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте записите за посевите директно от страницата на културата.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setCreateOpen(true)}>
          Добави посев
        </button>
      </div>

      <div className="space-y-3">
        {plantings.length === 0 && <div className="text-sm text-slate-600">Няма посеви за тази култура.</div>}

        {plantings.map((planting) => (
          <article key={planting.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">{formatBulgarianDate(planting.date)}</div>
                <div className="mt-1 text-sm text-slate-600">Количество: {planting.quantity}</div>
                {planting.description && <div className="mt-2 text-sm text-slate-700">{planting.description}</div>}
              </div>
              <PlantingRecordActions
                planting={planting}
                cropId={cropId}
                onRequestDelete={(selectedPlanting) => setDeleteTarget(selectedPlanting)}
              />
            </div>
          </article>
        ))}
      </div>

      <PlantingEditorDialog
        open={createOpen}
        mode="create"
        cropId={cropId}
        onClose={() => setCreateOpen(false)}
      />

      <PlantingDeleteDialog
        open={Boolean(deleteTarget)}
        cropId={cropId}
        plantingId={deleteTarget?.id ?? null}
        title={deleteTarget ? `${deleteTarget.date} / ${deleteTarget.quantity}` : ""}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}