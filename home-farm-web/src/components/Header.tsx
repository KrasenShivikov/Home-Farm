export default function Header() {
  return (
    <header className="site-header">
      <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden="true" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Home Farm
            </p>
            <p className="text-xl font-semibold text-slate-900">
              Умно фермерство у дома
            </p>
          </div>
        </div>
        <nav className="nav-links">
          <a className="nav-link" href="/">
            Начало
          </a>
          <a className="nav-link" href="/login">
            Вход
          </a>
          <a className="nav-link" href="/register">
            Регистрация
          </a>
        </nav>
      </div>
    </header>
  );
}
