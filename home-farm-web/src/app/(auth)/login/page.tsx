"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 800);
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <p className="eyebrow">Вход</p>
        <h1 className="auth-title">Добре дошли обратно</h1>
        <p className="auth-subtitle">
          Влезте в профила си, за да управлявате стопанството.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Моля, изчакайте..." : "Вход"}
          </button>
        </form>
        <p className="auth-footnote">
          Нямате профил? <a href="/register">Регистрация</a>
        </p>
      </div>
    </section>
  );
}
