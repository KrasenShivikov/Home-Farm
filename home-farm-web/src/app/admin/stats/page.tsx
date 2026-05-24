import AdminTabs from "@/components/admin/AdminTabs";
import AdminStatsView from "@/components/admin/AdminStatsView";
import { getAdminStats } from "@/actions/admin-stats";

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = (await searchParams) ?? {};
  const startDate = params.startDate ?? null;
  const endDate = params.endDate ?? null;
  const mainTab = params.mainTab === "orders" ? "orders" : "catalog";
  const catalogTab =
    params.catalogTab === "crops" || params.catalogTab === "products"
      ? params.catalogTab
      : "summary";
  const cropId = params.cropId ? Number(params.cropId) : null;
  const productId = params.productId ? Number(params.productId) : null;

  const stats = await getAdminStats({ startDate, endDate, cropId, productId });

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Статистика</h1>
        <p className="text-sm text-gray-600">
          Преглед на производството, продуктите и поръчките
        </p>
      </div>

      <AdminTabs active="stats" />

      <AdminStatsView
        stats={stats}
        startDate={startDate}
        endDate={endDate}
        initialMainTab={mainTab}
        initialCatalogTab={catalogTab}
      />
    </section>
  );
}
