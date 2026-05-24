"use client";

import { createSprayingAction, deleteSprayingAction, updateSprayingAction } from "@/actions/activity-actions";
import ActivityCrudManager from "@/components/activity-crud/ActivityCrudManager";

type Spraying = {
  id: number;
  date: string;
  quantity: string;
  description: string | null;
};

export default function SprayingManager({ sprayings, cropId }: { sprayings: Spraying[]; cropId: number }) {
  return (
    <ActivityCrudManager
      records={sprayings}
      cropId={cropId}
      label="Пръскане"
      pluralLabel="Пръскания"
      description="Управлявайте записите за пръсканията директно от страницата на културата."
      addButtonLabel="Добави пръскане"
      createAction={createSprayingAction}
      updateAction={updateSprayingAction}
      deleteAction={deleteSprayingAction}
    />
  );
}
