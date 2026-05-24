"use client";

import { ACTIVITY_TYPE_VALUES } from "@/lib/activity-types";
import { useToast } from "@/components/ui/toast";
import { formatDateInputValue } from "@/lib/format-date";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type ActivityActionState = {
  error?: string;
  success?: string;
};

export type ActivityFormValues = {
  id?: number;
  date?: string;
  quantity?: string;
  type?: string;
  description?: string | null;
};

type ActionFn = (
  prevState: ActivityActionState | null,
  formData: FormData
) => Promise<ActivityActionState>;

type ActivityEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  cropId: number;
  values?: ActivityFormValues;
  title: string;
  showQuantity?: boolean;
  showType?: boolean;
  onClose: () => void;
  actionFn: ActionFn;
};

function formatActivityQuantityInput(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return Number(value || 0).toFixed(2);
}

export default function ActivityEditorDialog({
  open,
  mode,
  cropId,
  values,
  title,
  showQuantity = false,
  showType = false,
  onClose,
  actionFn,
}: ActivityEditorDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<ActivityActionState | null, FormData>(actionFn, null);

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
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">{title}</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title.toLowerCase()}` : `Редакция на ${title.toLowerCase()}`}
            </h3>
            <p className="text-sm text-slate-600">Попълнете полетата и натиснете Запази или прекратете с Отказ.</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="cropId" value={cropId} />
          {!showQuantity && <input type="hidden" name="quantity" value={values?.quantity || "0"} />}
          {!showType && <input type="hidden" name="type" value={values?.type ?? ACTIVITY_TYPE_VALUES[0]} />}
          {mode === "edit" && <input type="hidden" name="id" value={values?.id ?? ""} />}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Дата
              <input type="date" name="date" defaultValue={formatDateInputValue(values?.date)} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            {showQuantity && (
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Количество
                <input type="number" step="0.01" name="quantity" defaultValue={formatActivityQuantityInput(values?.quantity)} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>
            )}
            {showType && (
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Тип
                <select name="type" defaultValue={values?.type ?? ACTIVITY_TYPE_VALUES[0]} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  {ACTIVITY_TYPE_VALUES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
            <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={onClose}>
              Отказ
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isPending}>
              {isPending ? "Запазване..." : "Запази"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
