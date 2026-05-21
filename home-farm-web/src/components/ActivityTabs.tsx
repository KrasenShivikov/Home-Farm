"use client";

import { useState } from "react";
import { formatBulgarianDate } from "@/lib/format-date";

export default function ActivityTabs({
  plantings = [],
  harvestings = [],
  sprayings = [],
  wastes = [],
}: {
  plantings?: any[];
  harvestings?: any[];
  sprayings?: any[];
  wastes?: any[];
}) {
  const [tab, setTab] = useState("plantings");

  const lists: Record<string, any[]> = {
    plantings,
    harvestings,
    sprayings,
    wastes,
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button className={`btn ${tab==='plantings'?'btn-primary':''}`} onClick={() => setTab('plantings')}>Посев</button>
        <button className={`btn ${tab==='harvestings'?'btn-primary':''}`} onClick={() => setTab('harvestings')}>Реколта</button>
        <button className={`btn ${tab==='sprayings'?'btn-primary':''}`} onClick={() => setTab('sprayings')}>Пръскане</button>
        <button className={`btn ${tab==='wastes'?'btn-primary':''}`} onClick={() => setTab('wastes')}>Загуби</button>
      </div>

      <div className="space-y-4">
        {lists[tab].length === 0 && <div className="text-sm text-gray-600">Няма записи.</div>}
        {lists[tab].map((r) => (
          <div key={r.id} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">{formatBulgarianDate(r.date)}</div>
              <div className="text-sm font-semibold">{r.quantity}</div>
            </div>
            {r.description && <div className="text-sm text-gray-600 mt-2">{r.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
