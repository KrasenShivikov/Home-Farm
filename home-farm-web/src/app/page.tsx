export default function Home() {
  return (
    <section className="py-8 pb-20">
      <div className="container grid gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Добре дошли</p>
          <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl">
            Организирайте семейната ферма с увереност и яснота.
          </h1>
          <p className="max-w-[34rem] text-[1.05rem] leading-relaxed text-slate-500">
            Следете посеви, реколти, преработени продукти и поръчки от едно
            място. Бърз достъп, ясен контрол и стабилен ритъм за сезоните.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(5,150,105,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_8px_24px_rgba(5,150,105,0.4)]" href="/login">
              Вход
            </a>
            <a className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-sm font-bold text-slate-800 transition-all duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm" href="/register">
              Регистрация
            </a>
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
          <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-800/[0.07] px-5 py-4 transition-colors hover:bg-emerald-800/[0.11]">
            <p className="text-sm font-medium text-slate-500">Активни култури</p>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-800">12</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-800/[0.07] px-5 py-4 transition-colors hover:bg-emerald-800/[0.11]">
            <p className="text-sm font-medium text-slate-500">Преработени продукти</p>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-800">5</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-800/[0.07] px-5 py-4 transition-colors hover:bg-emerald-800/[0.11]">
            <p className="text-sm font-medium text-slate-500">Поръчки този месец</p>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-800">18</p>
          </div>
          <p className="pt-1 text-sm leading-snug text-slate-400">
            Автоматични справки за загуби, добиви и продажби.
          </p>
        </div>
      </div>
    </section>
  );
}