"use client";

import { useState, useMemo } from "react";
import SearchBar from "./SearchBar";
import CropCard from "./CropCard";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map((c) => (
          <CropCard key={c.id} crop={c} />
        ))}
      </div>
    </div>
  );
}
