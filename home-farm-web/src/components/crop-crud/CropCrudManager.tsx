"use client";

import { useState } from "react";
import CropEditorDialog, { type CropFormValues } from "./CropEditorDialog";
import CropRecordActions, { type CropRecord } from "./CropRecordActions";
import CropDeleteDialog from "./CropDeleteDialog";

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type DeleteActionFn = (formData: FormData) => Promise<{ error?: string; success?: string }>;

type CropCrudManagerProps = {
  crops: CropRecord[];
  createAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: DeleteActionFn;
};

export default function CropCrudManager({ crops, createAction, updateAction, deleteAction }: CropCrudManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CropRecord | null>(null);

  const createValues: CropFormValues = {
    name: "",
    variety: "",
    forSale: false,
    price: "",
    description: "",
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Култури</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте културите директно от админ таблото.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setCreateOpen(true)}>
          Добави култура
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {crops.map((crop) => (
          <article key={crop.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{crop.name}</h3>
                {crop.variety && <p className="text-sm text-slate-600">{crop.variety}</p>}
              </div>

              <div className="text-sm text-slate-700">{crop.description ?? ""}</div>

              <div className="flex items-center justify-between text-sm">
                <div className="font-medium text-slate-700">{crop.price ? `${crop.price} лв` : "—"}</div>
                <div className="text-slate-600">{crop.forSale ? "За продажба" : "Не е за продажба"}</div>
              </div>

              <CropRecordActions crop={crop} onRequestDelete={(selectedCrop) => setDeleteTarget(selectedCrop)} updateAction={updateAction} />
            </div>
          </article>
        ))}
      </div>

      <CropEditorDialog
        open={createOpen}
        mode="create"
        values={createValues}
        title="култура"
        onClose={() => setCreateOpen(false)}
        actionFn={createAction}
      />

      <CropDeleteDialog
        open={Boolean(deleteTarget)}
        cropId={deleteTarget?.id ?? null}
        title={deleteTarget ? deleteTarget.name : ""}
        onClose={() => setDeleteTarget(null)}
        deleteAction={deleteAction}
      />
    </section>
  );
}