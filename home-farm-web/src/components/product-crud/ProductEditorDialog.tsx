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
  quantity?: string;
  price?: string;
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
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Продукти</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title.toLowerCase()}` : `Редакция на ${title.toLowerCase()}`}
            </h3>
            <p className="text-sm text-slate-600">Попълнете полетата и натиснете Запази или прекратете с Отказ.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={onClose}>
            Отказ
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={values?.id ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Име
              <input type="text" name="name" defaultValue={values?.name ?? ""} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Дата
              <input type="date" name="date" defaultValue={values?.date ?? ""} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Количество
              <input type="number" name="quantity" min="0" step="0.001" defaultValue={values?.quantity ?? "1.000"} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Цена
              <input type="number" name="price" min="0" step="0.01" defaultValue={values?.price ?? ""} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" />
            </label>
          </div>

          {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={onClose}>
              Отказ
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)] transition-all hover:-translate-y-px hover:bg-orange-600 disabled:opacity-60" type="submit" disabled={isPending}>
              {isPending ? "Запазване..." : "Запази"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}