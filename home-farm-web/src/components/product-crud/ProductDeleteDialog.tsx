"use client";

import { useToast } from "@/components/ui/toast";
import { useActionState, useEffect, useRef } from "react";

type ProductActionState = {
  error?: string;
  success?: string;
};

type DeleteActionFn = (formData: FormData) => Promise<ProductActionState>;

type ProductDeleteDialogProps = {
  open: boolean;
  productId: number | null;
  title: string;
  onClose: () => void;
  deleteAction: DeleteActionFn;
};

export default function ProductDeleteDialog({ open, productId, title, onClose, deleteAction }: ProductDeleteDialogProps) {
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<ProductActionState | null, FormData>(
    async (_prevState, formData) => deleteAction(formData),
    null
  );

  useEffect(() => {
    if (open) {
      didHandleSuccess.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (state?.success && !didHandleSuccess.current) {
      didHandleSuccess.current = true;
      showToast(state.success, "success");
      onClose();
    }
  }, [state?.success, onClose, showToast]);

  if (!open || !productId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="eyebrow">Изтриване</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Потвърдете изтриването</h3>
        <p className="mt-2 text-sm text-slate-600">Сигурни ли сте, че искате да изтриете {title}?</p>

        <form action={action} className="mt-5 flex flex-wrap justify-end gap-2">
          <input type="hidden" name="id" value={productId} />
          <button className="btn" type="button" onClick={onClose}>
            Отказ
          </button>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Изтриване..." : "Изтрий"}
          </button>
        </form>
      </div>
    </div>
  );
}