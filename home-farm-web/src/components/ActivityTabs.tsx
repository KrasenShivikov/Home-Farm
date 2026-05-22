"use client";

import { useState } from "react";
import PlantingManager from "@/components/plantings/PlantingManager";
import HarvestingManager from "@/components/harvestings/HarvestingManager";
import SprayingManager from "@/components/sprayings/SprayingManager";
import WasteManager from "@/components/wastes/WasteManager";

type ActivityTabsProps = {
  cropId: number;
  plantings?: any[];
  harvestings?: any[];
  sprayings?: any[];
  wastes?: any[];
};

export default function ActivityTabs({
  cropId,
  plantings = [],
  harvestings = [],
  sprayings = [],
  wastes = [],
}: ActivityTabsProps) {
  const [tab, setTab] = useState("plantings");

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
        {(["plantings", "harvestings", "sprayings", "wastes"] as const).map((key) => {
          const labels: Record<string, string> = { plantings: "Посев", harvestings: "Реколта", sprayings: "Пръскане", wastes: "Загуби" };
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={active
                ? "rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(234,88,12,0.25)]"
                : "rounded-xl px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
              }
            >
              {labels[key]}
            </button>
          );
        })}
      </div>

      {tab === "plantings" && <PlantingManager plantings={plantings} cropId={cropId} />}
      {tab === "harvestings" && <HarvestingManager harvestings={harvestings} cropId={cropId} />}
      {tab === "sprayings" && <SprayingManager sprayings={sprayings} cropId={cropId} />}
      {tab === "wastes" && <WasteManager wastes={wastes} cropId={cropId} />}
    </div>
  );
}
