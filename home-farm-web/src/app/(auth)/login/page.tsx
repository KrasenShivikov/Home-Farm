"use client";

import { loginAction } from "@/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => await loginAction(formData),
    null
  );

  const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <section className="py-14">
      <div className="mx-auto grid w-full max-w-md gap-5 rounded-2xl border border-slate-200 bg-white p-9 shadow-2xl">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-slate-400">Вход</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Добре дошли обратно</h1>
          <p className="mt-1 text-sm text-slate-500">Влезте в профила си, за да управлявате стопанството.</p>
        </div>
        <form className="grid gap-4" action={action}>
          {state?.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{state.error}</p>}
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Имейл
            <input type="email" name="email" placeholder="name@example.com" required autoComplete="email" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Парола
            <input type="password" name="password" placeholder="Вашата парола" required autoComplete="current-password" className={inputCls} />
          </label>
          <button className="mt-1 w-full rounded-full bg-emerald-600 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isPending}>
            {isPending ? "Моля, изчакайте..." : "Вход"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Нямате профил?{" "}
          <a href="/register" className="font-bold text-slate-900 hover:text-emerald-700">Регистрация</a>
        </p>
      </div>
    </section>
  );
}
