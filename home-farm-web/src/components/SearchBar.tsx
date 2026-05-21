"use client";

import { useState, useEffect } from "react";

export default function SearchBar({
  onChange,
  placeholder = "Търси култури...",
}: {
  onChange: (q: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onChange(q), 150);
    return () => clearTimeout(t);
  }, [q, onChange]);

  return (
    <div className="w-full max-w-md">
      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </div>
  );
}
