"use client";

import Link from "next/link";

export default function CropCard({ crop }: { crop: any }) {
  return (
    <article className="rounded-2xl border p-4 bg-white">
      <h3 className="text-lg font-semibold">{crop.name}</h3>
      {crop.variety && <p className="text-sm text-gray-600">{crop.variety}</p>}
      <p className="mt-3 text-sm text-gray-700">{crop.description ?? ""}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-slate-700 font-medium">{crop.price ? `${crop.price} €` : "—"}</div>
        <Link href={`/admin/crops/${crop.id}`} className="text-sm text-accent font-semibold">
          Преглед
        </Link>
      </div>
    </article>
  );
}
