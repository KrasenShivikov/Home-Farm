export default function Home() {
  return (
    <section className="hero">
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="eyebrow">Добре дошли</p>
          <h1 className="hero-title">
            Организирайте семейната ферма с увереност и яснота.
          </h1>
          <p className="hero-subtitle">
            Следете посеви, реколти, преработени продукти и поръчки от едно
            място. Бърз достъп, ясен контрол и стабилен ритъм за сезоните.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/login">
              Вход
            </a>
            <a className="btn btn-ghost" href="/register">
              Регистрация
            </a>
          </div>
        </div>
        <div className="hero-card">
          <div className="stat">
            <p className="stat-label">Активни култури</p>
            <p className="stat-value">12</p>
          </div>
          <div className="stat">
            <p className="stat-label">Преработени продукти</p>
            <p className="stat-value">5</p>
          </div>
          <div className="stat">
            <p className="stat-label">Поръчки този месец</p>
            <p className="stat-value">18</p>
          </div>
          <div className="card-note">
            Автоматични справки за загуби, добиви и продажби.
          </div>
        </div>
      </div>
    </section>
  );
}