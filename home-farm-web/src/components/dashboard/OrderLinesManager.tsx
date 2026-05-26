"use client";

import {
  addOrderLineAction,
  updateOrderLineAction,
  type OrderableCrop,
  type UserOrderItem,
} from "@/actions/user-dashboard";
import OrderLineEditorDialog, { type OrderLineEditorValues } from "./OrderLineEditorDialog";
import { useState } from "react";

type OrderLinesManagerProps = {
  orderId: number;
  orderStatus: string;
  items: UserOrderItem[];
  crops: OrderableCrop[];
};

export default function OrderLinesManager({ orderId, orderStatus, items, crops }: OrderLinesManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createSession, setCreateSession] = useState(0);
  const [editTarget, setEditTarget] = useState<OrderLineEditorValues | null>(null);
  const [editSession, setEditSession] = useState(0);

  const canEdit = orderStatus === "Pending";
  const orderTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Редове</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Продукти в поръчката</h2>
          <p className="mt-1 text-sm text-slate-600">
            {canEdit ? "Можете да добавяте и редактирате редове." : "Редовете са само за преглед."}
          </p>
        </div>

        {canEdit ? (
          <button
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700"
            type="button"
            onClick={() => {
              setCreateSession((value) => value + 1);
              setCreateOpen(true);
            }}
          >
            Добави ред
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">Няма добавени продукти.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const lineTotal = (Number(item.quantity) * Number(item.price)).toFixed(2);

            return (
              <div key={item.lineId ?? `${orderId}-${item.cropName}-${item.quantity}`} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_7rem_7rem_7rem_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-950">{item.cropName}</div>
                  <div className="truncate text-sm text-slate-500">{item.cropVariety || "Без сорт"}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400">Кол.</div>
                  <div className="font-bold tabular-nums text-slate-900">{Number(item.quantity || 0).toFixed(3)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400">Цена</div>
                  <div className="font-bold tabular-nums text-slate-900">{Number(item.price || 0).toFixed(2)} €</div>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-emerald-600">Сума</div>
                  <div className="font-bold tabular-nums text-emerald-900">{lineTotal} €</div>
                </div>
                <div className="sm:text-right">
                  {canEdit && item.lineId ? (
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm"
                      type="button"
                      onClick={() => {
                        setEditSession((value) => value + 1);
                        setEditTarget({
                          lineId: item.lineId,
                          cropId: item.cropId,
                          quantity: item.quantity,
                        });
                      }}
                    >
                      Редактирай
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 px-5 py-4">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-600">Обща стойност</div>
              <div className="mt-1 text-sm text-emerald-900">Сума на всички редове в поръчката</div>
            </div>
            <div className="text-2xl font-extrabold tabular-nums text-emerald-950">
              {orderTotal.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      <OrderLineEditorDialog
        key={`create-${orderId}-${createSession}`}
        open={createOpen}
        mode="create"
        orderId={orderId}
        crops={crops}
        title="ред"
        onClose={() => setCreateOpen(false)}
        actionFn={addOrderLineAction}
      />

      <OrderLineEditorDialog
        key={`edit-${orderId}-${editSession}-${editTarget?.lineId ?? "none"}`}
        open={Boolean(editTarget)}
        mode="edit"
        orderId={orderId}
        crops={crops}
        values={editTarget ?? undefined}
        title="ред"
        onClose={() => setEditTarget(null)}
        actionFn={updateOrderLineAction}
      />
    </section>
  );
}
