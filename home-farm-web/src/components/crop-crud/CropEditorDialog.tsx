"use client";

import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type CropActionState = {
  error?: string;
  success?: string;
};

export type CropFormValues = {
  id?: number;
  name?: string;
  variety?: string | null;
  forSale?: boolean;
  price?: string | null;
  description?: string | null;
};

type CropEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  values?: CropFormValues;
  onClose: () => void;
  title: string;
  actionFn: (
    prevState: CropActionState | null,
    formData: FormData
  ) => Promise<CropActionState>;
};

export default function CropEditorDialog({ open, mode, values, onClose, title, actionFn }: CropEditorDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<CropActionState | null, FormData>(actionFn, null);

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
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Култури</p>
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
              <input type="text" name="name" defaultValue={values?.name ?? ""} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Сорт
              <input type="text" name="variety" defaultValue={values?.variety ?? ""} placeholder="По желание" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Цена
              <input type="number" step="0.01" name="price" defaultValue={values?.price ?? ""} placeholder="По желание" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Описание
              <input type="text" name="description" defaultValue={values?.description ?? ""} placeholder="По желание" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="forSale" defaultChecked={values?.forSale ?? false} />
            За продажба
          </label>

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