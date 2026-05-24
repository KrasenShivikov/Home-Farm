import {
  createExpenceAction,
  deleteExpenceAction,
  getExpenceTypes,
  getExpences,
  updateExpenceAction,
} from "@/actions/expence-actions";
import AdminTabs from "@/components/admin/AdminTabs";
import ExpenceCrudManager from "@/components/expence-crud/ExpenceCrudManager";
import ExpenceSearchPanel from "@/components/expence-crud/ExpenceSearchPanel";

export const metadata = {
  title: "Admin - Разходи",
};

export default async function AdminExpencesPage({
  searchParams,
}: {
  searchParams?: Promise<{ startDate?: string; endDate?: string; typeId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const startDate = params.startDate ?? "";
  const endDate = params.endDate ?? "";
  const typeId = params.typeId ?? "";

  const [types, expenceRecords] = await Promise.all([
    getExpenceTypes(),
    getExpences({ startDate, endDate, typeId }),
  ]);

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Разходи</h1>
        <p className="text-sm text-gray-600">Преглед и управление на разходите</p>
      </div>

      <AdminTabs active="expences" />

      <ExpenceSearchPanel
        startDate={startDate}
        endDate={endDate}
        typeId={typeId}
        types={types}
      />

      <ExpenceCrudManager
        expences={expenceRecords}
        types={types}
        createAction={createExpenceAction}
        updateAction={updateExpenceAction}
        deleteAction={deleteExpenceAction}
      />
    </section>
  );
}
