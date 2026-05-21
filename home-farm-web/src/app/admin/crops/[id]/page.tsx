import ActivityTabs from "@/components/ActivityTabs";
import { getCropActivities } from "@/actions/crop-activities";
import { getCropById } from "@/actions/crop-detail";

export default async function CropDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const crop = await getCropById(id);
  if (!crop) return <div className="container py-10">Култура не е намерена.</div>;

  const { plantings: plant, harvestings: harvest, sprayings: spray, wastes: waste } = await getCropActivities(id);

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {crop.name} {crop.variety ? `— ${crop.variety}` : ""}
        </h1>
        <p className="text-sm text-gray-600">{crop.description}</p>
      </div>

      <ActivityTabs cropId={id} plantings={plant} harvestings={harvest} sprayings={spray} wastes={waste} />
    </section>
  );
}
