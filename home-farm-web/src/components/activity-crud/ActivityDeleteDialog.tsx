"use client";

import { useToast } from "@/components/ui/toast";
import { useActionState, useEffect, useRef } from "react";

type ActivityActionState = {
  error?: string;
  success?: string;
};

type DeleteActionFn = (formData: FormData) => Promise<ActivityActionState>;

type ActivityDeleteDialogProps = {
  open: boolean;
  cropId: number;
  activityId: number | null;
  title: string;
  label: string;
  onClose: () => void;
  deleteAction: DeleteActionFn;
};

export default function ActivityDeleteDialog({
  open,
  cropId,
  activityId,
  title,
  label,
  onClose,
  deleteAction,
}: ActivityDeleteDialogProps) {
  const { showToast } = useToast();
  const didHandleSuccess = useRef(false);
  const [state, action, isPending] = useActionState<ActivityActionState | null, FormData>(
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

  if (!open || !activityId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Изтриване</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Потвърдете изтриването</h3>
        <p className="mt-2 text-sm text-slate-600">Сигурни ли сте, че искате да изтриете {label} {title}?</p>

        <form action={action} className="mt-5 flex flex-wrap justify-end gap-2">
          <input type="hidden" name="cropId" value={cropId} />
          <input type="hidden" name="id" value={activityId} />
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={onClose}>
            Отказ
          </button>
          <button className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)] transition-all hover:-translate-y-px hover:bg-orange-600 disabled:opacity-60" type="submit" disabled={isPending}>
            {isPending ? "Изтриване..." : "Изтрий"}
          </button>
        </form>
      </div>
    </div>
  );
}