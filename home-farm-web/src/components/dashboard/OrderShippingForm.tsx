"use client";

import { updateOrderShippingAction } from "@/actions/user-dashboard";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type OrderShippingFormProps = {
  canEdit: boolean;
  orderId: number;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
};

type ActionState = {
  error?: string;
  success?: string;
};

export default function OrderShippingForm({
  canEdit,
  orderId,
  shippingCity,
  shippingStreet,
  shippingPostalCode,
  shippingCountry,
}: OrderShippingFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const handledSuccess = useRef<string | null>(null);
  const handledError = useRef<string | null>(null);
  const [state, action, isPending] = useActionState<ActionState | null, FormData>(updateOrderShippingAction, null);

  useEffect(() => {
    if (state?.success && state.success !== handledSuccess.current) {
      handledSuccess.current = state.success;
      showToast(state.success, "success");
      router.refresh();
    }
  }, [router, showToast, state?.success]);

  useEffect(() => {
    if (state?.error && state.error !== handledError.current) {
      handledError.current = state.error;
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  return (
    <form action={action} className="space-y-3 p-5 text-sm">
      <input type="hidden" name="orderId" value={orderId} />

      <label className="grid gap-1.5 font-semibold text-slate-700">
        Град
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          defaultValue={shippingCity ?? ""}
          disabled={!canEdit}
          name="shippingCity"
          required
        />
      </label>

      <label className="grid gap-1.5 font-semibold text-slate-700">
        Адрес / улица
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          defaultValue={shippingStreet ?? ""}
          disabled={!canEdit}
          name="shippingStreet"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label className="grid gap-1.5 font-semibold text-slate-700">
          Пощ. код
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            defaultValue={shippingPostalCode ?? ""}
            disabled={!canEdit}
            name="shippingPostalCode"
            required
          />
        </label>

        <label className="grid gap-1.5 font-semibold text-slate-700">
          Държава
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            defaultValue={shippingCountry ?? ""}
            disabled={!canEdit}
            name="shippingCountry"
            required
          />
        </label>
      </div>

      {canEdit ? (
        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Запазване..." : "Запази адрес"}
        </button>
      ) : (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Адресът може да се редактира само при чакаща поръчка.
        </div>
      )}
    </form>
  );
}
