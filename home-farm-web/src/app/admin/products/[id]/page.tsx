import ProductCropLinkManager from "@/components/product-crops/ProductCropLinkManager";
import {
  getAllCropsForProductLinking,
  getLinkedCropsForProduct,
  getProductById,
} from "@/actions/product-detail";
import Link from "next/link";

function formatProductQuantity(value: string | number | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function formatProductPrice(value: string | number | null | undefined) {
  return value ? `${Number(value).toFixed(2)} €` : "—";
}

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
    <section className="container space-y-8 py-10">
      <div className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/85 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Продукт</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-600">Свързване на култури към продукта</p>
          </div>
          <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-emerald-300 hover:text-emerald-800 hover:shadow-sm" href="/admin/products">
            Назад
          </Link>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Количество</div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-950">{formatProductQuantity(product.quantity)}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Цена</div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">{formatProductPrice(product.price)}</div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-700">Съставки</div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums text-amber-900">{linked.length}</div>
          </div>
        </div>
      </div>

      <ProductCropLinkManager productId={product.id} crops={allCrops} linkedCrops={linked} />
    </section>
  );
}
