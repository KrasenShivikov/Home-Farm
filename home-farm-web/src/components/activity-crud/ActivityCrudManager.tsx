"use client";

import { useState } from "react";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { ACTIVITY_TYPE_VALUES } from "@/lib/activity-types";
import { formatBulgarianDate } from "@/lib/format-date";
import ActivityEditorDialog, { type ActivityFormValues } from "./ActivityEditorDialog";
import ActivityRecordActions, { type ActivityRecord } from "./ActivityRecordActions";
import ActivityDeleteDialog from "./ActivityDeleteDialog";

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type DeleteActionFn = (formData: FormData) => Promise<{ error?: string; success?: string }>;

type ActivityCrudManagerProps = {
  records: ActivityRecord[];
  cropId: number;
  label: string;
  pluralLabel: string;
  description: string;
  addButtonLabel: string;
  createAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: DeleteActionFn;
};

export default function ActivityCrudManager({
  records,
  cropId,
  label,
  pluralLabel,
  description,
  addButtonLabel,
  createAction,
  updateAction,
  deleteAction,
}: ActivityCrudManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActivityRecord | null>(null);
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(records, 5);

  const createValues: ActivityFormValues = {
    date: "",
    quantity: "",
    type: ACTIVITY_TYPE_VALUES[0],
    description: "",
  };

  return (
    <section className="mt-10 space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">{pluralLabel}</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 hover:bg-orange-600" type="button" onClick={() => setCreateOpen(true)}>
          {addButtonLabel}
        </button>
      </div>

      <div className="space-y-3">
        {records.length === 0 && <div className="text-sm text-slate-600">Няма записи за тази култура.</div>}

        {pageItems.map((record) => (
          <article key={record.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">{formatBulgarianDate(record.date)}</div>
                <div className="mt-1 text-sm text-slate-600">Тип: {record.type}</div>
                <div className="mt-1 text-sm text-slate-600">Количество: {record.quantity}</div>
                {record.description && <div className="mt-2 text-sm text-slate-700">{record.description}</div>}
              </div>
              <ActivityRecordActions
                record={record}
                cropId={cropId}
                label={label}
                updateAction={updateAction}
                onRequestDelete={(selectedRecord) => setDeleteTarget(selectedRecord)}
              />
            </div>
          </article>
        ))}
      </div>
      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={records.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <ActivityEditorDialog
        open={createOpen}
        mode="create"
        cropId={cropId}
        values={createValues}
        title={label}
        onClose={() => setCreateOpen(false)}
        actionFn={createAction}
      />

      <ActivityDeleteDialog
        open={Boolean(deleteTarget)}
        cropId={cropId}
        activityId={deleteTarget?.id ?? null}
        title={deleteTarget ? `${deleteTarget.date} / ${deleteTarget.quantity}` : ""}
        label={label.toLowerCase()}
        onClose={() => setDeleteTarget(null)}
        deleteAction={deleteAction}
      />
    </section>
  );
}
