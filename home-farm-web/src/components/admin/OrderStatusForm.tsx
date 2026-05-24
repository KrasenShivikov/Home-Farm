"use client";

import { updateAdminOrderStatusAction } from "@/actions/admin-orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { useToast } from "@/components/ui/toast";
import { formatOrderStatus, ORDER_STATUSES } from "@/lib/order-statuses";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type ActionState = {
  error?: string;
  success?: string;
};

type OrderStatusFormProps = {
  orderId: number;
  status: string;
};

export default function OrderStatusForm({ orderId, status }: OrderStatusFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const successRef = useRef<string | null>(null);
  const errorRef = useRef<string | null>(null);

  const [state, action, isPending] = useActionState<ActionState | null, FormData>(updateAdminOrderStatusAction, null);

  useEffect(() => {
    if (state?.success && state.success !== successRef.current) {
      successRef.current = state.success;
      showToast(state.success, "success");
      router.refresh();
    }
  }, [router, showToast, state?.success]);

  useEffect(() => {
    if (state?.error && state.error !== errorRef.current) {
      errorRef.current = state.error;
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  return (
    <form action={action} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Статус</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Промяна на статус</h2>
          <OrderStatusBadge status={status} />
        </div>
      </div>

      <input type="hidden" name="orderId" value={orderId} />

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Нов статус</span>
        <select name="status" defaultValue={status} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900">
          {ORDER_STATUSES.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {formatOrderStatus(statusOption)}
            </option>
          ))}
        </select>
      </label>

      <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isPending}>
        {isPending ? "Запазване..." : "Запази статус"}
      </button>
    </form>
  );
}
