import ProductCropLinkManager from "@/components/product-crops/ProductCropLinkManager";
import {
  getAllCropsForProductLinking,
  getLinkedCropsForProduct,
  getProductById,
} from "@/actions/product-detail";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return <div className="container py-10">Невалиден продукт.</div>;
  }

  const product = await getProductById(id);

  if (!product) {
    return <div className="container py-10">Продуктът не е намерен.</div>;
  }

  const allCrops = await getAllCropsForProductLinking();

  const linked = await getLinkedCropsForProduct(id);

  return (
    <section className="container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-sm text-gray-600">Свързване на култури към продукта</p>
        <p className="text-sm text-gray-600">Количество: {product.quantity}</p>
        <p className="text-sm text-gray-600">Цена: {product.price ?? "—"}</p>
      </div>

      <ProductCropLinkManager productId={product.id} crops={allCrops} linkedCrops={linked} />
    </section>
  );
}
