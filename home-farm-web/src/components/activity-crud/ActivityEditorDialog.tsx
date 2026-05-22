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
  onClose: () => void;
  actionFn: ActionFn;
};

export default function ActivityEditorDialog({
  open,
  mode,
  cropId,
  values,
  title,
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
            <p className="eyebrow">{title}</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title.toLowerCase()}` : `Редакция на ${title.toLowerCase()}`}
            </h3>
            <p className="text-sm text-slate-600">Попълнете полетата и натиснете Запази или прекратете с Отказ.</p>
          </div>
          <button className="btn" type="button" onClick={onClose}>
            Отказ
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="cropId" value={cropId} />
          {mode === "edit" && <input type="hidden" name="id" value={values?.id ?? ""} />}

          <div className="grid gap-4 md:grid-cols-4">
            <label className="field">
              Дата
              <input type="date" name="date" defaultValue={formatDateInputValue(values?.date)} required />
            </label>
            <label className="field">
              Количество
              <input type="number" step="0.001" name="quantity" defaultValue={values?.quantity ?? ""} required />
            </label>
            <label className="field">
              Тип
              <select name="type" defaultValue={values?.type ?? ACTIVITY_TYPE_VALUES[0]} required>
                {ACTIVITY_TYPE_VALUES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Описание
              <input type="text" name="description" defaultValue={values?.description ?? ""} placeholder="По желание" />
            </label>
          </div>

          {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button className="btn" type="button" onClick={onClose}>
              Отказ
            </button>
            <button className="btn btn-primary" type="submit" disabled={isPending}>
              {isPending ? "Запазване..." : "Запази"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}