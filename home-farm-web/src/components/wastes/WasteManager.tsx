"use client";

import { createWasteAction, deleteWasteAction, updateWasteAction } from "@/actions/activity-actions";
import ActivityCrudManager from "@/components/activity-crud/ActivityCrudManager";

type Waste = {
  id: number;
  date: string;
  quantity: string;
  type: string;
  description: string | null;
};

export default function WasteManager({ wastes, cropId }: { wastes: Waste[]; cropId: number }) {
  return (
    <ActivityCrudManager
      records={wastes}
      cropId={cropId}
      label="Загуба"
      pluralLabel="Загуби"
      description="Управлявайте записите за загубите директно от страницата на културата."
      addButtonLabel="Добави загуба"
      createAction={createWasteAction}
      updateAction={updateWasteAction}
      deleteAction={deleteWasteAction}
    />
  );
}