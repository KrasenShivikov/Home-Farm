"use client";

import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type OrderLineEditorState = {
  error?: string;
  success?: string;
};

export type OrderLineEditorValues = {
  lineId?: number;
  cropId?: number;
  quantity?: string;
};

export type OrderLineCropOption = {
  id: number;
  name: string;
  variety: string | null;
  price: string | null;
};

type OrderLineEditorDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  orderId: number;
  crops: OrderLineCropOption[];
  values?: OrderLineEditorValues;
  title: string;
  onClose: () => void;
  actionFn: (
    prevState: OrderLineEditorState | null,
    formData: FormData
  ) => Promise<OrderLineEditorState>;
};

export default function OrderLineEditorDialog({
  open,
  mode,
  orderId,
  crops,
  values,
  title,
  onClose,
  actionFn,
}: OrderLineEditorDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<OrderLineEditorState | null, FormData>(actionFn, null);

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
  }, [onClose, router, showToast, state?.success]);

  useEffect(() => {
    if (state?.error && !didHandleSuccess.current) {
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Поръчка</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title.toLowerCase()}` : `Редакция на ${title.toLowerCase()}`}
            </h3>
            <p className="text-sm text-slate-600">Изберете култура и количество за реда на поръчката.</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="lineId" value={values?.lineId ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Култура
              <select name="cropId" defaultValue={values?.cropId ?? (crops[0]?.id ?? "")} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                    {crop.variety ? ` — ${crop.variety}` : ""}
                    {crop.price ? ` (${crop.price} €)` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Количество
              <input type="number" name="quantity" min="0.001" step="0.001" defaultValue={values?.quantity ?? "1.000"} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
          </div>

          {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

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
