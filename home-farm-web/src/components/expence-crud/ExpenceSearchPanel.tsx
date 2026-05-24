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
    <form className="mb-8 rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm" method="get">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Филтри</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Търсене на разходи</h2>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_minmax(12rem,1fr)_auto] lg:items-end">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          От дата
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          До дата
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Тип
          <select
            name="typeId"
            defaultValue={typeId}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Всички</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-px hover:bg-emerald-700">
            Търси
          </button>
          <Link href="/admin/expences" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm">
            Изчисти
          </Link>
        </div>
      </div>
    </form>
  );
}
