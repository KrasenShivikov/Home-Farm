import { formatOrderStatus, ORDER_STATUSES } from "@/lib/order-statuses";
import Link from "next/link";

type AdminOrdersSearchPanelProps = {
  user?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

export default function AdminOrdersSearchPanel({
  user = "",
  date = "",
  startDate = date,
  endDate = date,
  status = "",
}: AdminOrdersSearchPanelProps) {
  return (
    <form className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" method="get">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">Филтри</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">Търсене на поръчки</h2>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(10rem,0.75fr)_minmax(10rem,0.75fr)_minmax(12rem,0.9fr)_auto] lg:items-end">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Потребител</span>
          <input
            type="text"
            name="user"
            defaultValue={user}
            placeholder="Име или имейл"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>От дата</span>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>До дата</span>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Статус</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Всички</option>
            {ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {formatOrderStatus(statusOption)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(5,150,105,0.24)] transition-all hover:-translate-y-px hover:bg-emerald-700 md:w-auto">
            Търси
          </button>
          <Link href="/admin/orders" className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:w-auto">
            Изчисти
          </Link>
        </div>
      </div>
    </form>
  );
}
