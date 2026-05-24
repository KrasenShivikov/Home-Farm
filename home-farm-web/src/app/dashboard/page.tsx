import { getUserOrders } from "@/actions/user-dashboard";
import DashboardOrdersList from "@/components/dashboard/DashboardOrdersList";
import DashboardOrdersSearchPanel from "@/components/dashboard/DashboardOrdersSearchPanel";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ startDate?: string; endDate?: string; status?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};
  const startDate = params.startDate ?? "";
  const endDate = params.endDate ?? "";
  const status = params.status ?? "";

  const orders = await getUserOrders(session.userId, { startDate, endDate, status });
  const totalOrdersValue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const activeOrdersCount = orders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length;

  return (
    <section className="container py-10">
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Потребителско табло</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Здравейте, {session.name}</h1>
            <p className="mt-1 text-sm text-slate-600">Следете поръчките си и създавайте нови заявки.</p>
          </div>
          <Link href="/dashboard/orders/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,0.28)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
            Добави поръчка
          </Link>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Всички поръчки</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-slate-950">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-600">Активни</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-amber-900">{activeOrdersCount}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-5 py-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600">Обща стойност</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-900">{totalOrdersValue.toFixed(2)} €</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Вашите поръчки</p>
              <h2 className="text-2xl font-bold text-slate-950">Списък с поръчки</h2>
            </div>
          </div>

          <DashboardOrdersSearchPanel startDate={startDate} endDate={endDate} status={status} />

          <DashboardOrdersList orders={orders} />
        </section>
      </div>
    </section>
  );
}
