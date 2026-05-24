"use client";

import {
  addCropToProductAction,
  removeCropFromProductAction,
  type ProductCropActionState,
  updateCropInProductAction,
} from "@/actions/product-crops-actions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

type CropOption = {
  id: number;
  name: string;
  variety: string | null;
};

type ProductCropRecord = {
  cropId: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
};

type ProductCropLinkManagerProps = {
  productId: number;
  crops: CropOption[];
  linkedCrops: ProductCropRecord[];
};

export default function ProductCropLinkManager({ productId, crops, linkedCrops }: ProductCropLinkManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCropRecord | null>(null);
  const lastCreateSuccess = useRef<string | null>(null);
  const lastCreateError = useRef<string | null>(null);

  const [state, action, isPending] = useActionState<ProductCropActionState | null, FormData>(
    addCropToProductAction,
    null
  );

  useEffect(() => {
    if (state?.success && state.success !== lastCreateSuccess.current) {
      lastCreateSuccess.current = state.success;
      showToast(state.success, "success");
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, showToast, state?.success]);

  useEffect(() => {
    if (state?.error && state.error !== lastCreateError.current) {
      lastCreateError.current = state.error;
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Състав на продукта</p>
        <h2 className="text-xl font-semibold text-slate-900">Добавяне на култура към продукт</h2>
      </div>

      <form ref={formRef} action={action} className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-4">
        <input type="hidden" name="productId" value={productId} />

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
          Култура
          <select name="cropId" defaultValue="" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="" disabled>
              Изберете култура
            </option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
                {crop.variety ? ` — ${crop.variety}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Количество
          <input type="number" name="quantity" min="0.001" step="0.001" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </label>

        <div className="flex items-end justify-end">
          <button className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60 md:w-auto" type="submit" disabled={isPending || crops.length === 0}>
            {isPending ? "Добавяне..." : "Добави"}
          </button>
        </div>
      </form>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Добавени култури</h3>

        {linkedCrops.length === 0 ? (
          <p className="text-sm text-slate-600">Все още няма добавени култури към този продукт.</p>
        ) : (
          <div className="space-y-2">
            {linkedCrops.map((item) => (
              <LinkedCropRow key={item.cropId} item={item} productId={productId} onRequestDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      <LinkedCropDeleteDialog
        open={Boolean(deleteTarget)}
        productId={productId}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}

function LinkedCropRow({
  item,
  productId,
  onRequestDelete,
}: {
  item: ProductCropRecord;
  productId: number;
  onRequestDelete: (item: ProductCropRecord) => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const lastUpdateSuccess = useRef<string | null>(null);
  const lastUpdateError = useRef<string | null>(null);

  const [updateState, updateAction, isUpdating] = useActionState<ProductCropActionState | null, FormData>(
    updateCropInProductAction,
    null
  );

  useEffect(() => {
    if (updateState?.success && updateState.success !== lastUpdateSuccess.current) {
      lastUpdateSuccess.current = updateState.success;
      showToast(updateState.success, "success");
      setIsEditing(false);
      router.refresh();
    }
  }, [router, showToast, updateState?.success]);

  useEffect(() => {
    if (updateState?.error && updateState.error !== lastUpdateError.current) {
      lastUpdateError.current = updateState.error;
      showToast(updateState.error, "error");
    }
  }, [showToast, updateState?.error]);

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3">
      <div>
        <p className="font-medium text-slate-900">
          {item.cropName}
          {item.cropVariety ? ` — ${item.cropVariety}` : ""}
        </p>
        <p className="text-sm text-slate-600">Количество: {item.quantity}</p>
      </div>

      {isEditing ? (
        <form action={updateAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="cropId" value={item.cropId} />
          <label className="grid min-w-40 gap-1.5 text-sm font-semibold text-slate-700">
            Ново количество
            <input type="number" name="quantity" min="0.001" step="0.001" defaultValue={item.quantity} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm disabled:opacity-60" type="button" onClick={() => setIsEditing(false)} disabled={isUpdating}>
            Отказ
          </button>
          <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isUpdating}>
            {isUpdating ? "Запазване..." : "Запази"}
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={() => setIsEditing(true)}>
            Редакция
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm" type="button" onClick={() => onRequestDelete(item)}>
            Премахни
          </button>
        </div>
      )}
    </article>
  );
}

function LinkedCropDeleteDialog({
  open,
  productId,
  item,
  onClose,
}: {
  open: boolean;
  productId: number;
  item: ProductCropRecord | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const lastDeleteSuccess = useRef<string | null>(null);
  const lastDeleteError = useRef<string | null>(null);

  const [removeState, removeAction, isRemoving] = useActionState<ProductCropActionState | null, FormData>(
    removeCropFromProductAction,
    null
  );

  useEffect(() => {
    if (removeState?.success && removeState.success !== lastDeleteSuccess.current) {
      lastDeleteSuccess.current = removeState.success;
      showToast(removeState.success, "success");
      onClose();
      router.refresh();
    }
  }, [onClose, removeState?.success, router, showToast]);

  useEffect(() => {
    if (removeState?.error && removeState.error !== lastDeleteError.current) {
      lastDeleteError.current = removeState.error;
      showToast(removeState.error, "error");
    }
  }, [removeState?.error, showToast]);

  if (!open || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Премахване</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Потвърждение</h3>
        <p className="mt-2 text-sm text-slate-600">
          Сигурни ли сте, че искате да премахнете {item.cropName}
          {item.cropVariety ? ` — ${item.cropVariety}` : ""} от продукта?
        </p>

        <form action={removeAction} className="mt-5 flex flex-wrap justify-end gap-2">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="cropId" value={item.cropId} />
          <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:shadow-sm disabled:opacity-60" type="button" onClick={onClose} disabled={isRemoving}>
            Отказ
          </button>
          <button className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(225,29,72,0.25)] transition-all hover:-translate-y-px hover:bg-rose-700 disabled:opacity-60" type="submit" disabled={isRemoving}>
            {isRemoving ? "Премахване..." : "Потвърди"}
          </button>
        </form>
      </div>
    </div>
  );
}
