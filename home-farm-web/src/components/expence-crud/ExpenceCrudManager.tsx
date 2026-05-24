"use client";

import type { ExpenceRecord, ExpenceTypeOption } from "@/actions/expence-actions";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatBulgarianDate } from "@/lib/format-date";
import { useState } from "react";
import ExpenceDeleteDialog from "./ExpenceDeleteDialog";
import ExpenceEditorDialog, { type ExpenceFormValues } from "./ExpenceEditorDialog";
import ExpenceRecordActions from "./ExpenceRecordActions";

type ActionFn = (
  prevState: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

type DeleteActionFn = (formData: FormData) => Promise<{ error?: string; success?: string }>;

type ExpenceCrudManagerProps = {
  expences: ExpenceRecord[];
  types: ExpenceTypeOption[];
  createAction: ActionFn;
  updateAction: ActionFn;
  deleteAction: DeleteActionFn;
};

function formatMoney(value: string | null) {
  if (!value) {
    return "—";
  }

  return `${Number(value).toFixed(2)} €`;
}

export default function ExpenceCrudManager({
  expences,
  types,
  createAction,
  updateAction,
  deleteAction,
}: ExpenceCrudManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExpenceRecord | null>(null);
  const { page, pageCount, pageItems, pageSize, setPage } = usePagination(expences, 8);

  const createValues: ExpenceFormValues = {
    name: "",
    date: "",
    value: "",
    description: "",
    expencesTypeId: types[0]?.id,
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Разходи</p>
          <h2 className="text-xl font-semibold text-slate-900">Добавяне, редакция и изтриване</h2>
          <p className="text-sm text-slate-600">Управлявайте разходите и техните типове от тази страница.</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          type="button"
          onClick={() => setCreateOpen(true)}
        >
          Добави разход
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Дата</th>
                <th className="px-5 py-3">Име</th>
                <th className="px-5 py-3">Тип</th>
                <th className="px-5 py-3 text-right">Стойност</th>
                <th className="px-5 py-3">Описание</th>
                <th className="px-5 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expences.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-slate-600" colSpan={6}>
                    Няма намерени разходи.
                  </td>
                </tr>
              ) : (
                pageItems.map((expence) => (
                  <tr key={expence.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatBulgarianDate(expence.date)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{expence.name}</td>
                    <td className="px-5 py-4 text-slate-600">{expence.typeName}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-slate-900">
                      {formatMoney(expence.value)}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-slate-600">{expence.description || "—"}</td>
                    <td className="px-5 py-4">
                      <ExpenceRecordActions
                        expence={expence}
                        types={types}
                        onRequestDelete={(selectedExpence) => setDeleteTarget(selectedExpence)}
                        updateAction={updateAction}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        totalItems={expences.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <ExpenceEditorDialog
        open={createOpen}
        mode="create"
        values={createValues}
        types={types}
        title="разход"
        onClose={() => setCreateOpen(false)}
        actionFn={createAction}
      />

      <ExpenceDeleteDialog
        open={Boolean(deleteTarget)}
        expenceId={deleteTarget?.id ?? null}
        title={deleteTarget ? deleteTarget.name : ""}
        onClose={() => setDeleteTarget(null)}
        deleteAction={deleteAction}
      />
    </section>
  );
}
