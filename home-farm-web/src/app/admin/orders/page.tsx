import { getAdminOrders } from "@/actions/admin-orders";
import AdminOrdersList from "@/components/admin/AdminOrdersList";
import AdminOrdersSearchPanel from "@/components/admin/AdminOrdersSearchPanel";
import AdminTabs from "@/components/admin/AdminTabs";

export const metadata = {
  title: "Admin - Поръчки",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; date?: string; status?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = params.user ?? "";
  const date = params.date ?? "";
  const status = params.status ?? "";

  const orders = await getAdminOrders({ user, date, status });

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Поръчки</h1>
        <p className="text-sm text-gray-600">Преглед на всички потребителски поръчки</p>
      </div>

      <AdminTabs active="orders" />

      <AdminOrdersSearchPanel user={user} date={date} status={status} />

      <AdminOrdersList orders={orders} />
    </section>
  );
}
