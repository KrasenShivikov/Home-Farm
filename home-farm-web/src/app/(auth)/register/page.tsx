"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 800);
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <p className="eyebrow">Регистрация</p>
        <h1 className="auth-title">Създайте профил</h1>
        <p className="auth-subtitle">
          Регистрирайте се, за да следите култури, реколти и поръчки.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Име
            <input
              type="text"
              name="name"
              placeholder="Вашето име"
              required
              autoComplete="name"
            />
          </label>
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
              placeholder="Изберете парола"
              required
              autoComplete="new-password"
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Моля, изчакайте..." : "Създай профил"}
          </button>
        </form>
        <p className="auth-footnote">
          Вече имате профил? <a href="/login">Вход</a>
        </p>
      </div>
    </section>
  );
}
