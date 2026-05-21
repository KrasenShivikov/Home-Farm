import { ORDER_STATUSES } from "@/lib/order-statuses";
import Link from "next/link";

type AdminOrdersSearchPanelProps = {
  user?: string;
  date?: string;
  status?: string;
};

export default function AdminOrdersSearchPanel({ user = "", date = "", status = "" }: AdminOrdersSearchPanelProps) {
  return (
    <form className="mb-8 rounded-2xl border bg-white p-4 shadow-sm" method="get">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Потребител</span>
          <input
            type="text"
            name="user"
            defaultValue={user}
            placeholder="Име или имейл"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Дата</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Статус</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
          >
            <option value="">Всички</option>
            {ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-3">
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Търси
          </button>
          <Link href="/admin/orders" className="btn w-full md:w-auto">
            Изчисти
          </Link>
        </div>
      </div>
    </form>
  );
}