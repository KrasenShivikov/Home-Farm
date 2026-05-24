import { db } from "@/db";
import { crops } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

function formatPrice(price: string | null) {
  if (!price) {
    return "Цена при запитване";
  }

  return `${Number(price).toFixed(2)} €`;
}

export default async function Home() {
  const saleCrops = await db
    .select({
      id: crops.id,
      name: crops.name,
      variety: crops.variety,
      price: crops.price,
      description: crops.description,
    })
    .from(crops)
    .where(eq(crops.forSale, true))
    .orderBy(crops.name);

  return (
    <main className="pb-20">
      <section className="container grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-7 lg:sticky lg:top-28">
          <div className="space-y-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">
              Добре дошли
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl">
              Свежи продукти от нашата домашна ферма.
            </h1>
            <p className="max-w-[34rem] text-[1.05rem] leading-relaxed text-slate-600">
              Разгледайте наличните продукти за продажба, отгледани с грижа и подредени ясно за лесна поръчка.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-emerald-900/10 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">Налични продукти</div>
              <div className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-900">{saleCrops.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Поръчки</div>
              <div className="mt-1 text-sm font-semibold text-slate-700">След регистрация</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(5,150,105,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_8px_24px_rgba(5,150,105,0.4)]" href="/register">
              Регистрация
            </Link>
            <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-sm font-bold text-slate-800 transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm" href="/login">
              Вход
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Каталог</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Продукти за продажба</h2>
            </div>
            <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-px hover:border-emerald-300 hover:text-emerald-800 hover:shadow-sm" href="/login">
              Поръчай
            </Link>
          </div>

          {saleCrops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/80 px-6 py-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">В момента няма активни продукти за продажба.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Проверете отново скоро. Каталогът се обновява според сезона и наличната реколта.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {saleCrops.map((crop) => (
                <article key={crop.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <div className="border-b border-slate-100 bg-emerald-50/70 px-5 py-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="break-words text-xl font-extrabold leading-tight text-slate-950">{crop.name}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">{crop.variety || "Сезонен продукт"}</p>
                      </div>
                      <div className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-sm font-bold tabular-nums text-emerald-800 shadow-sm">
                        {formatPrice(crop.price)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <p className="min-h-12 text-sm leading-6 text-slate-600">
                      {crop.description || "Свеж продукт от домашната ферма, наличен за поръчка според текущата реколта."}
                    </p>
                    <Link className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.26)] transition-all hover:-translate-y-px hover:bg-emerald-700" href="/login">
                      Влезте, за да поръчате
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
