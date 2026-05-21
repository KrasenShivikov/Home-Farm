"use client";

import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type ProductActionState = {
  error?: string;
  success?: string;
};

export type ProductFormValues = {
  id?: number;
  name?: string;
  date?: string;
};

type ProductEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  values?: ProductFormValues;
  onClose: () => void;
  title: string;
  actionFn: (
    prevState: ProductActionState | null,
    formData: FormData
  ) => Promise<ProductActionState>;
};

export default function ProductEditorDialog({ open, mode, values, onClose, title, actionFn }: ProductEditorDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<ProductActionState | null, FormData>(actionFn, null);

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
            <p className="eyebrow">Продукти</p>
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
          <input type="hidden" name="id" value={values?.id ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="field">
              Име
              <input type="text" name="name" defaultValue={values?.name ?? ""} required />
            </label>
            <label className="field">
              Дата
              <input type="date" name="date" defaultValue={values?.date ?? ""} required />
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