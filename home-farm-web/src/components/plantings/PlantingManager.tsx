"use client";

import { createPlantingAction, deletePlantingAction, updatePlantingAction } from "@/actions/planting-actions";
import ActivityCrudManager from "@/components/activity-crud/ActivityCrudManager";

type PlantingManagerProps = {
  plantings: { id: number; date: string; quantity: string; description: string | null }[];
  cropId: number;
};

export default function PlantingManager({ plantings, cropId }: PlantingManagerProps) {
  return (
    <ActivityCrudManager
      records={plantings}
      cropId={cropId}
      label="Посев"
      pluralLabel="Посеви"
      description="Управлявайте записите за посевите директно от страницата на културата."
      addButtonLabel="Добави посев"
      createAction={createPlantingAction}
      updateAction={updatePlantingAction}
      deleteAction={deletePlantingAction}
    />
  );
}