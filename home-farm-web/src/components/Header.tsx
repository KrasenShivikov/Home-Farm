import { logoutAction } from "@/actions/auth";
import { getSession } from "@/lib/session";
import Link from "next/link";
import AppIcon from "./AppIcon";

export default async function Header() {
  const session = await getSession();

  const navLinkBase =
    "inline-flex items-center gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-800 transition-all duration-150 hover:-translate-y-px hover:border-emerald-100 hover:bg-white hover:text-emerald-800 hover:shadow-sm";

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/82 backdrop-blur-md">
      <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="flex items-center gap-3" href="/">
          <div className="logo-mark" aria-hidden="true" />
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-emerald-700/70">
              Home Farm
            </p>
            <p className="text-base font-bold tracking-tight text-slate-900">
              Умно фермерство у дома
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {!session && (
            <Link className={navLinkBase} href="/">
              <AppIcon name="home" />
              Начало
            </Link>
          )}
          {session && session.role !== "admin" && (
            <Link className={`${navLinkBase} text-emerald-700`} href="/dashboard">
              <AppIcon name="sprout" />
              Табло
            </Link>
          )}
          {session?.role === "admin" && (
            <Link className={`${navLinkBase} text-emerald-700`} href="/admin">
              <AppIcon name="sprout" />
              Табло
            </Link>
          )}
          {session ? (
            <>
              <span className="px-3 text-sm font-semibold text-slate-600">
                Здравейте, {session.name}
              </span>
              <Link className={navLinkBase} href="/dashboard/profile">
                <AppIcon name="user" />
                Профил
              </Link>
              <form action={logoutAction} style={{ display: "inline" }}>
                <button
                  type="submit"
                  className={`${navLinkBase} text-rose-600 hover:text-rose-700`}
                >
                  <AppIcon name="log-out" />
                  Изход
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className={navLinkBase} href="/login">
                <AppIcon name="log-in" />
                Вход
              </Link>
              <Link className={navLinkBase} href="/register">
                <AppIcon name="user-plus" />
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
