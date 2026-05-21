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
      <div className="flex gap-2 mb-4">
        <button className={`btn ${tab === "plantings" ? "btn-primary" : ""}`} type="button" onClick={() => setTab("plantings")}>
          Посев
        </button>
        <button className={`btn ${tab === "harvestings" ? "btn-primary" : ""}`} type="button" onClick={() => setTab("harvestings")}>
          Реколта
        </button>
        <button className={`btn ${tab === "sprayings" ? "btn-primary" : ""}`} type="button" onClick={() => setTab("sprayings")}>
          Пръскане
        </button>
        <button className={`btn ${tab === "wastes" ? "btn-primary" : ""}`} type="button" onClick={() => setTab("wastes")}>
          Загуби
        </button>
      </div>

      {tab === "plantings" && <PlantingManager plantings={plantings} cropId={cropId} />}
      {tab === "harvestings" && <HarvestingManager harvestings={harvestings} cropId={cropId} />}
      {tab === "sprayings" && <SprayingManager sprayings={sprayings} cropId={cropId} />}
      {tab === "wastes" && <WasteManager wastes={wastes} cropId={cropId} />}
    </div>
  );
}
