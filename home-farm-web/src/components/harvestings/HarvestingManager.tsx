"use client";

import {
  createHarvestingAction,
  deleteHarvestingAction,
  updateHarvestingAction,
} from "@/actions/activity-actions";
import ActivityCrudManager from "@/components/activity-crud/ActivityCrudManager";

type Harvesting = {
  id: number;
  date: string;
  quantity: string;
  description: string | null;
};

export default function HarvestingManager({ harvestings, cropId }: { harvestings: Harvesting[]; cropId: number }) {
  return (
    <ActivityCrudManager
      records={harvestings}
      cropId={cropId}
      label="Реколта"
      pluralLabel="Реколти"
      description="Управлявайте записите за реколтата директно от страницата на културата."
      addButtonLabel="Добави реколта"
      createAction={createHarvestingAction}
      updateAction={updateHarvestingAction}
      deleteAction={deleteHarvestingAction}
    />
  );
}