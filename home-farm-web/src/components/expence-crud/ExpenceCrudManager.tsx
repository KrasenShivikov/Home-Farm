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
  const [createSession, setCreateSession] = useState(0);
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
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-emerald-900/10 bg-white/85 px-6 py-5 shadow-sm backdrop-blur-sm">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Разходи</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Добавяне, редакция и изтриване</h2>
          <p className="mt-1 text-sm text-slate-600">Управлявайте разходите и техните типове от тази страница.</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          type="button"
          onClick={() => {
            setCreateSession((value) => value + 1);
            setCreateOpen(true);
          }}
        >
          Добави разход
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/90 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
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
                  <td className="px-5 py-10 text-center text-sm font-medium text-slate-500" colSpan={6}>
                    Няма намерени разходи.
                  </td>
                </tr>
              ) : (
                pageItems.map((expence) => (
                  <tr key={expence.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">{formatBulgarianDate(expence.date)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{expence.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{expence.typeName}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-extrabold tabular-nums text-rose-700">
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
        key={`create-${createSession}`}
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
