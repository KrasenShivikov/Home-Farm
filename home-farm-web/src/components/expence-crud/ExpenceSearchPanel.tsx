import type { ExpenceTypeOption } from "@/actions/expence-actions";
import Link from "next/link";

type ExpenceSearchPanelProps = {
  startDate?: string;
  endDate?: string;
  typeId?: string;
  types: ExpenceTypeOption[];
};

export default function ExpenceSearchPanel({
  startDate = "",
  endDate = "",
  typeId = "",
  types,
}: ExpenceSearchPanelProps) {
  return (
    <form className="mb-8 rounded-2xl border bg-white p-4 shadow-sm" method="get">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>От дата</span>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>До дата</span>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Тип</span>
          <select
            name="typeId"
            defaultValue={typeId}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          >
            <option value="">Всички</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-3">
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Търси
          </button>
          <Link href="/admin/expences" className="btn w-full md:w-auto">
            Изчисти
          </Link>
        </div>
      </div>
    </form>
  );
}
