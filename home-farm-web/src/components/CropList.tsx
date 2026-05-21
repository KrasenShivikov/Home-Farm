"use client";

import { useState, useMemo } from "react";
import SearchBar from "./SearchBar";
import CropCrudManager from "./crop-crud/CropCrudManager";
import { createCropAction, deleteCropAction, updateCropAction } from "@/actions/crop-actions";

export default function CropList({ initial }: { initial: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((c) => (c.name + " " + (c.variety || "")).toLowerCase().includes(q));
  }, [initial, query]);

  return (
    <div className="space-y-6">
      <SearchBar onChange={setQuery} />
      <CropCrudManager crops={filtered} createAction={createCropAction} updateAction={updateCropAction} deleteAction={deleteCropAction} />
    </div>
  );
}
