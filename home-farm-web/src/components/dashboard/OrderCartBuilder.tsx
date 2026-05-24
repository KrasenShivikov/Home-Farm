"use client";

import { createOrderAction, type CartItemInput, type OrderableCrop } from "@/actions/user-dashboard";
import { useToast } from "@/components/ui/toast";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

type OrderFormState = {
  error?: string;
  success?: string;
};

type CartEntry = {
  cropId: number;
  name: string;
  variety: string | null;
  price: string | null;
  quantity: string;
};

type OrderCartBuilderProps = {
  crops: OrderableCrop[];
  shippingDefaults: {
    shippingCity: string;
    shippingStreet: string;
    shippingPostalCode: string;
    shippingCountry: string;
  };
};

function formatQuantity(value: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toFixed(3);
}

export default function OrderCartBuilder({ crops, shippingDefaults }: OrderCartBuilderProps) {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(crops[0]?.id ?? null);
  const [quantity, setQuantity] = useState("1.000");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const lastSuccess = useRef<string | null>(null);
  const lastError = useRef<string | null>(null);

  const [state, action, isPending] = useActionState<OrderFormState | null, FormData>(createOrderAction, null);

  const cartJson = useMemo(() => {
    const payload: CartItemInput[] = cart.map((item) => ({
      cropId: item.cropId,
      quantity: item.quantity,
    }));

    return JSON.stringify(payload);
  }, [cart]);

  const selectedCrop = crops.find((crop) => crop.id === selectedCropId) ?? null;

  useEffect(() => {
    if (state?.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      showToast(state.success, "success");
      setCart([]);
      formRef.current?.reset();
      setSelectedCropId(crops[0]?.id ?? null);
      setQuantity("1.000");
    }
  }, [crops, showToast, state?.success]);

  useEffect(() => {
    if (state?.error && state.error !== lastError.current) {
      lastError.current = state.error;
      showToast(state.error, "error");
    }
  }, [showToast, state?.error]);

  function addToCart() {
    if (!selectedCrop) {
      showToast("Изберете култура.", "error");
      return;
    }

    const normalizedQuantity = formatQuantity(quantity);
    const numericQuantity = Number(normalizedQuantity);

    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      showToast("Количеството трябва да е число по-голямо от 0.", "error");
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.cropId === selectedCrop.id);

      if (existing) {
        return current.map((item) =>
          item.cropId === selectedCrop.id
            ? {
                ...item,
                quantity: (Number(item.quantity) + numericQuantity).toFixed(3),
              }
            : item
        );
      }

      return [
        ...current,
        {
          cropId: selectedCrop.id,
          name: selectedCrop.name,
          variety: selectedCrop.variety,
          price: selectedCrop.price,
          quantity: normalizedQuantity,
        },
      ];
    });

    setQuantity("1.000");
  }

  function removeFromCart(cropId: number) {
    setCart((current) => current.filter((item) => item.cropId !== cropId));
  }

  const cartTotal = cart.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const itemTotal = Number(item.quantity) * price;
    return sum + itemTotal;
  }, 0);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Продукт</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Добавяне в кошницата</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-[1.3fr_0.7fr_auto] md:items-end">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Култура
              <select value={selectedCropId ?? ""} onChange={(event) => setSelectedCropId(Number(event.target.value))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
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
              <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>

            <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60" type="button" onClick={addToCart} disabled={crops.length === 0}>
              Добави
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Кошница</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Избрани продукти</h2>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold tabular-nums text-emerald-800">
              {cartTotal.toFixed(2)} €
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">Кошницата е празна.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item) => {
                const lineTotal = (Number(item.quantity) * Number(item.price || 0)).toFixed(2);

                return (
                  <div key={item.cropId} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_7rem_7rem_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-950">{item.name}</div>
                      <div className="truncate text-sm text-slate-500">{item.variety || "Без сорт"}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400">Кол.</div>
                      <div className="font-bold tabular-nums text-slate-900">{item.quantity}</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                      <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-emerald-600">Сума</div>
                      <div className="font-bold tabular-nums text-emerald-900">{lineTotal} €</div>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm" type="button" onClick={() => removeFromCart(item.cropId)}>
                      Премахни
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <form ref={formRef} action={action} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <input type="hidden" name="cartJson" value={cartJson} />
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Доставка</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Адрес и изпращане</h2>
        </div>

        <div className="space-y-4 p-5">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Град за доставка
            <input name="shippingCity" defaultValue={shippingDefaults.shippingCity} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Адрес / улица
            <input name="shippingStreet" defaultValue={shippingDefaults.shippingStreet} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Пощенски код
              <input name="shippingPostalCode" defaultValue={shippingDefaults.shippingPostalCode} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Държава
              <input name="shippingCountry" defaultValue={shippingDefaults.shippingCountry} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </label>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600">Обща стойност</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-900">{cartTotal.toFixed(2)} €</div>
          </div>

          <button className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isPending || cart.length === 0}>
            {isPending ? "Създаване..." : "Създай поръчка"}
          </button>
        </div>
      </form>
    </section>
  );
}
