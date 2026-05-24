import { ORDER_STATUSES } from "@/lib/order-statuses";
import Link from "next/link";

type DashboardOrdersSearchPanelProps = {
  startDate?: string;
  endDate?: string;
  status?: string;
};

function formatStatusLabel(status: string) {
  switch (status) {
    case "Pending":
      return "Чакаща";
    case "Accepted":
      return "Приета";
    case "Completed":
      return "Завършена";
    case "Cancelled":
      return "Отказана";
    default:
      return status;
  }
}

export default function DashboardOrdersSearchPanel({
  startDate = "",
  endDate = "",
  status = "",
}: DashboardOrdersSearchPanelProps) {
  return (
    <form className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" method="get">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Филтри</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-950">Търсене в поръчките</h3>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          От дата
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            defaultValue={startDate}
            name="startDate"
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          До дата
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            defaultValue={endDate}
            name="endDate"
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Статус
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            defaultValue={status}
            name="status"
          >
            <option value="">Всички</option>
            {ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {formatStatusLabel(statusOption)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-3">
          <button
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700 md:w-auto"
            type="submit"
          >
            Търси
          </button>
          <Link
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:w-auto"
            href="/dashboard"
          >
            Изчисти
          </Link>
        </div>
      </div>
    </form>
  );
}
