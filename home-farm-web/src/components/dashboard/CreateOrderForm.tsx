"use client";

import { createOrderAction, type OrderableCrop } from "@/actions/user-dashboard";
import { useToast } from "@/components/ui/toast";
import { useActionState, useEffect, useRef } from "react";

type OrderFormState = {
  error?: string;
  success?: string;
};

type CreateOrderFormProps = {
  crops: OrderableCrop[];
};

export default function CreateOrderForm({ crops }: CreateOrderFormProps) {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const lastSuccess = useRef<string | null>(null);
  const lastError = useRef<string | null>(null);

  const [state, action, isPending] = useActionState<OrderFormState | null, FormData>(createOrderAction, null);

  useEffect(() => {
    if (state?.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      showToast(state.success, "success");
      formRef.current?.reset();
    }
  }, [showToast, state?.success]);

  useEffect(() => {
    if (state?.error && state.error !== lastError.current) {
      lastError.current = state.error;
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Нова поръчка</p>
        <h2 className="text-xl font-semibold text-slate-900">Създаване на поръчка</h2>
        <p className="text-sm text-slate-600">Изберете култура и въведете количество, за да създадете поръчка.</p>
      </div>

      <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-[1.3fr_0.7fr_auto] md:items-end">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Култура
          <select name="cropId" defaultValue="" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20">
            <option value="" disabled>
              Изберете култура
            </option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
                {crop.variety ? ` — ${crop.variety}` : ""}
                {crop.price ? ` (${crop.price} лв)` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Количество
          <input type="number" name="quantity" min="0.001" step="0.001" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20" />
        </label>

        <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-60" type="submit" disabled={isPending || crops.length === 0}>
          {isPending ? "Създаване..." : "Създай поръчка"}
        </button>
      </form>

      {crops.length === 0 ? (
        <p className="text-sm text-slate-600">Няма налични култури за поръчка.</p>
      ) : null}

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
    </section>
  );
}
