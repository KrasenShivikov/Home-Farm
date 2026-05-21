import { db } from "@/db";
import { crops } from "@/db/schema";
import CropList from "@/components/CropList";

export const metadata = {
  title: "Admin — Култури",
};

export default async function AdminPage() {
  const all = await db.select().from(crops).orderBy(crops.name);

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Култури</h1>
        <p className="text-sm text-gray-600">Преглед и управление на културите</p>
      </div>
      <CropList initial={all} />
    </section>
  );
}
