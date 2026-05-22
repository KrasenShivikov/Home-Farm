import { getSession } from "@/lib/session";
import { logoutAction } from "@/actions/auth";

export default async function Header() {
  const session = await getSession();

  const navLinkBase = "text-sm font-semibold text-slate-800 px-4 py-2 rounded-full border border-transparent transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm hover:-translate-y-px";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden="true" />
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-400">Home Farm</p>
            <p className="text-base font-bold tracking-tight text-slate-900">Умно фермерство у дома</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          <a className={navLinkBase} href="/">Начало</a>
          {session && session.role !== "admin" && (
            <a className={`${navLinkBase} text-orange-600`} href="/dashboard">Табло</a>
          )}
          {session && (
            <a className={navLinkBase} href="/dashboard/profile">Профил</a>
          )}
          {session?.role === "admin" && (
            <a className={`${navLinkBase} text-orange-600`} href="/admin">Табло</a>
          )}
          {session ? (
            <>
              <span className="px-3 text-sm font-semibold text-slate-600">
                Здравейте, {session.name}
              </span>
              <form action={logoutAction} style={{ display: "inline" }}>
                <button type="submit" className={`${navLinkBase} text-red-600 hover:text-red-700`}>
                  Изход
                </button>
              </form>
            </>
          ) : (
            <>
              <a className={navLinkBase} href="/login">Вход</a>
              <a className={navLinkBase} href="/register">Регистрация</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
