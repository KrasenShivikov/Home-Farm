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
  showQuantity?: boolean;
  showType?: boolean;
  createAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: DeleteActionFn;
};

function formatActivityQuantity(value: string | number | null | undefined) {
  return Number(value || 0).toFixed(2);
}

export default function ActivityCrudManager({
  records,
  cropId,
  label,
  pluralLabel,
  description,
  addButtonLabel,
  showQuantity = false,
  showType = false,
  createAction,
  updateAction,
  deleteAction,
}: ActivityCrudManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActivityRecord | null>(null);
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(records, 5);

  const createValues: ActivityFormValues = {
    date: "",
    quantity: showQuantity ? "" : "0",
    type: ACTIVITY_TYPE_VALUES[0],
    description: "",
  };

  return (
    <section className="mt-10 space-y-6 rounded-3xl border border-emerald-900/10 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">{pluralLabel}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Добавяне, редакция и изтриване</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700" type="button" onClick={() => setCreateOpen(true)}>
          {addButtonLabel}
        </button>
      </div>

      <div className="space-y-3">
        {records.length === 0 && (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-5 py-8 text-center text-sm font-medium text-emerald-800">
            Няма записи за тази култура.
          </div>
        )}

        {pageItems.map((record) => (
          <article key={record.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-start sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold tabular-nums text-emerald-800">
                    {formatBulgarianDate(record.date)}
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    #{record.id}
                  </div>
                </div>

                {(showQuantity || showType) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {showQuantity && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div className="text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">Количество</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{formatActivityQuantity(record.quantity)}</div>
                      </div>
                    )}
                    {showType && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">Тип</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{record.type ?? ACTIVITY_TYPE_VALUES[0]}</div>
                    </div>
                    )}
                  </div>
                )}

                {record.description && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {record.description}
                  </div>
                )}
              </div>
              <ActivityRecordActions
                record={record}
                cropId={cropId}
                label={label}
                showQuantity={showQuantity}
                showType={showType}
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
        showQuantity={showQuantity}
        showType={showType}
        onClose={() => setCreateOpen(false)}
        actionFn={createAction}
      />

      <ActivityDeleteDialog
        open={Boolean(deleteTarget)}
        cropId={cropId}
        activityId={deleteTarget?.id ?? null}
        title={deleteTarget ? deleteTarget.date : ""}
        label={label.toLowerCase()}
        onClose={() => setDeleteTarget(null)}
        deleteAction={deleteAction}
      />
    </section>
  );
}
