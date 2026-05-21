"use client";

import { loginAction } from "@/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => await loginAction(formData),
    null
  );

  return (
    <section className="auth">
      <div className="auth-card">
        <p className="eyebrow">Вход</p>
        <h1 className="auth-title">Добре дошли обратно</h1>
        <p className="auth-subtitle">
          Влезте в профила си, за да управлявате стопанството.
        </p>
        <form className="auth-form" action={action}>
          {state?.error && <p className="text-red-500 font-medium">{state.error}</p>}
          <label className="field">
            Имейл
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            Парола
            <input
              type="password"
              name="password"
              placeholder="Вашата парола"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Моля, изчакайте..." : "Вход"}
          </button>
        </form>
        <p className="auth-footnote">
          Нямате профил? <a href="/register">Регистрация</a>
        </p>
      </div>
    </section>
  );
}
