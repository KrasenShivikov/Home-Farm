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
        <p className="eyebrow">Нова поръчка</p>
        <h2 className="text-xl font-semibold text-slate-900">Създаване на поръчка</h2>
        <p className="text-sm text-slate-600">Изберете култура и въведете количество, за да създадете поръчка.</p>
      </div>

      <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-[1.3fr_0.7fr_auto] md:items-end">
        <label className="field">
          Култура
          <select name="cropId" defaultValue="" required>
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

        <label className="field">
          Количество
          <input type="number" name="quantity" min="0.001" step="0.001" required />
        </label>

        <button className="btn btn-primary" type="submit" disabled={isPending || crops.length === 0}>
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
