import { db } from "@/db";
import { products } from "@/db/schema";
import ProductList from "@/components/product-crud/ProductList";
import AdminTabs from "@/components/admin/AdminTabs";

export const metadata = {
  title: "Admin — Продукти",
};

export default async function ProductsAdminPage() {
  const all = await db.select().from(products).orderBy(products.date);

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Продукти</h1>
        <p className="text-sm text-gray-600">Преглед и управление на продуктите</p>
      </div>

      <AdminTabs active="products" />

      <ProductList initial={all} />
    </section>
  );
}
