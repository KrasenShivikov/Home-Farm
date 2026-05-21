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
};

function formatQuantity(value: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toFixed(3);
}

export default function OrderCartBuilder({ crops }: OrderCartBuilderProps) {
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
    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <p className="eyebrow">Нова поръчка</p>
        <h2 className="text-xl font-semibold text-slate-900">Кошница за поръчка</h2>
        <p className="text-sm text-slate-600">Добавете няколко култури и изпратете една поръчка с много редове.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr_auto] md:items-end">
        <label className="field">
          Култура
          <select value={selectedCropId ?? ""} onChange={(event) => setSelectedCropId(Number(event.target.value))}>
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
          <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>

        <button className="btn" type="button" onClick={addToCart} disabled={crops.length === 0}>
          Добави в кошницата
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-slate-600">Кошницата е празна.</p>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Култура</th>
                  <th className="px-4 py-3 font-medium">Количество</th>
                  <th className="px-4 py-3 font-medium">Цена</th>
                  <th className="px-4 py-3 font-medium">Сума</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cart.map((item) => {
                  const lineTotal = (Number(item.quantity) * Number(item.price || 0)).toFixed(2);

                  return (
                    <tr key={item.cropId}>
                      <td className="px-4 py-3 text-slate-900">
                        {item.name}
                        {item.variety ? <span className="text-slate-500"> — {item.variety}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-700">{item.price} лв</td>
                      <td className="px-4 py-3 text-slate-700">{lineTotal} лв</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn" type="button" onClick={() => removeFromCart(item.cropId)}>
                          Премахни
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Обща стойност: {cartTotal.toFixed(2)} лв</p>
            <form ref={formRef} action={action}>
              <input type="hidden" name="cartJson" value={cartJson} />
              <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? "Създаване..." : "Създай поръчка"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
