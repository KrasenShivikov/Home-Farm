"use client";

import { cancelOrderAction, deleteOrderAction } from "@/actions/user-dashboard";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

type ActionState = {
  error?: string;
  success?: string;
};

type OrderDetailActionsProps = {
  orderId: number;
  status: string;
};

export default function OrderDetailActions({ orderId, status }: OrderDetailActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const cancelSuccess = useRef<string | null>(null);
  const cancelError = useRef<string | null>(null);
  const deleteSuccess = useRef<string | null>(null);
  const deleteError = useRef<string | null>(null);

  const [cancelState, cancelAction, cancelPending] = useActionState<ActionState | null, FormData>(cancelOrderAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState | null, FormData>(deleteOrderAction, null);

  useEffect(() => {
    if (cancelState?.success && cancelState.success !== cancelSuccess.current) {
      cancelSuccess.current = cancelState.success;
      showToast(cancelState.success, "success");
      router.refresh();
    }
  }, [cancelState?.success, router, showToast]);

  useEffect(() => {
    if (cancelState?.error && cancelState.error !== cancelError.current) {
      cancelError.current = cancelState.error;
      showToast(cancelState.error, "error");
    }
  }, [cancelState?.error, showToast]);

  useEffect(() => {
    if (deleteState?.success && deleteState.success !== deleteSuccess.current) {
      deleteSuccess.current = deleteState.success;
      showToast(deleteState.success, "success");
      router.push("/dashboard");
      router.refresh();
    }
  }, [deleteState?.success, router, showToast]);

  useEffect(() => {
    if (deleteState?.error && deleteState.error !== deleteError.current) {
      deleteError.current = deleteState.error;
      showToast(deleteState.error, "error");
    }
  }, [deleteState?.error, showToast]);

  const canCancel = status !== "Cancelled" && status !== "Completed";
  const canDelete = status !== "Completed";

  return (
    <div className="flex flex-wrap gap-3">
      {canCancel ? (
        <form action={cancelAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <button className="btn" type="submit" disabled={cancelPending}>
            {cancelPending ? "Отказване..." : "Откажи поръчка"}
          </button>
        </form>
      ) : null}

      {canDelete ? (
        <form action={deleteAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <button className="btn btn-primary" type="submit" disabled={deletePending}>
            {deletePending ? "Изтриване..." : "Изтрий поръчка"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
