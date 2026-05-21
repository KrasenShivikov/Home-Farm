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
            <p className="eyebrow">Поръчка</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {mode === "create" ? `Добавяне на ${title.toLowerCase()}` : `Редакция на ${title.toLowerCase()}`}
            </h3>
            <p className="text-sm text-slate-600">Изберете култура и количество за реда на поръчката.</p>
          </div>
          <button className="btn" type="button" onClick={onClose}>
            Отказ
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="lineId" value={values?.lineId ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="field">
              Култура
              <select name="cropId" defaultValue={values?.cropId ?? (crops[0]?.id ?? "")} required>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                    {crop.variety ? ` — ${crop.variety}` : ""}
                    {crop.price ? ` (${crop.price} лв)` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Количество
              <input type="number" name="quantity" min="0.001" step="0.001" defaultValue={values?.quantity ?? "1.000"} required />
            </label>
          </div>

          {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

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
