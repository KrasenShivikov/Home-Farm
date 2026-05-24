"use client";

import type { ExpenceTypeOption } from "@/actions/expence-actions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type ExpenceActionState = {
  error?: string;
  success?: string;
};

export type ExpenceFormValues = {
  id?: number;
  name?: string;
  expencesTypeId?: number;
  description?: string | null;
  date?: string;
  value?: string | null;
};

type ExpenceEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  values?: ExpenceFormValues;
  types: ExpenceTypeOption[];
  onClose: () => void;
  title: string;
  actionFn: (
    prevState: ExpenceActionState | null,
    formData: FormData
  ) => Promise<ExpenceActionState>;
};

export default function ExpenceEditorDialog({
  open,
  mode,
  values,
  types,
  onClose,
  title,
  actionFn,
}: ExpenceEditorDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<ExpenceActionState | null, FormData>(actionFn, null);

  useEffect(() => {
    if (open) {
      didHandleSuccess.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (state?.success && !didHandleSuccess.current) {
      didHandleSuccess.current = true;
      showToast(state.success, "success");
      router.refresh();
      onClose();
    }
  }, [state?.success, onClose, router, showToast]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Разходи</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title}` : `Редакция на ${title}`}
            </h3>
            <p className="text-sm text-slate-600">Попълнете полетата и натиснете Запази.</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={values?.id ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Име
              <input
                type="text"
                name="name"
                defaultValue={values?.name ?? ""}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Тип
              <select
                name="expencesTypeId"
                defaultValue={values?.expencesTypeId ?? ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Изберете тип</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Нов тип
              <input
                type="text"
                name="expencesTypeName"
                placeholder="Само ако липсва в списъка"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Дата
              <input
                type="date"
                name="date"
                defaultValue={values?.date ?? ""}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Стойност
              <input
                type="number"
                name="value"
                min="0"
                step="0.01"
                defaultValue={values?.value ?? ""}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
              Описание
              <textarea
                name="description"
                defaultValue={values?.description ?? ""}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
          </div>

          {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm"
              type="button"
              onClick={onClose}
            >
              Отказ
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Запазване..." : "Запази"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
