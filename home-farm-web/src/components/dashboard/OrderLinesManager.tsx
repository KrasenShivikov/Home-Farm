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

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Редакция на редове</p>
          <h2 className="text-xl font-semibold text-slate-900">Продукти в поръчката</h2>
          <p className="text-sm text-slate-600">
            {canEdit ? "Можете да добавяте и редактирате редове." : "Редовете са само за преглед."}
          </p>
        </div>

        {canEdit ? (
          <button
            className="btn btn-primary"
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
            {items.map((item) => {
              const lineTotal = (Number(item.quantity) * Number(item.price)).toFixed(2);

              return (
                <tr key={item.lineId ?? `${orderId}-${item.cropName}-${item.quantity}`}>
                  <td className="px-4 py-3 text-slate-900">
                    {item.cropName}
                    {item.cropVariety ? <span className="text-slate-500"> — {item.cropVariety}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-700">{item.price} лв</td>
                  <td className="px-4 py-3 text-slate-700">{lineTotal} лв</td>
                  <td className="px-4 py-3 text-right">
                    {canEdit && item.lineId ? (
                      <button
                        className="btn"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
