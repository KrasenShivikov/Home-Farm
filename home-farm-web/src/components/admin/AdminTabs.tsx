import Link from "next/link";

type AdminTabsProps = {
  active: "crops" | "products" | "orders" | "stats";
};

type Tab = { key: string; href: string; label: string; icon?: boolean };
const tabs: Tab[] = [
  { key: "crops", href: "/admin", label: "Култури" },
  { key: "products", href: "/admin/products", label: "Продукти" },
  { key: "orders", href: "/admin/orders", label: "Поръчки" },
  { key: "stats", href: "/admin/stats", label: "Статистика", icon: true },
];

export default function AdminTabs({ active }: AdminTabsProps) {
  const base = "inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-150";
  const inactive = `${base} border-transparent bg-transparent text-slate-500 hover:bg-white/80 hover:text-slate-900`;
  const activeCls = `${base} border-orange-500 bg-orange-500 text-white shadow-[0_4px_14px_rgba(234,88,12,0.28)] cursor-default`;

  return (
    <nav
      className="mb-7 flex w-fit flex-wrap gap-1.5 rounded-full border border-slate-200/80 bg-white/65 p-1.5 backdrop-blur-md"
      aria-label="Admin navigation"
    >
      {tabs.map((tab) =>
        tab.key === active ? (
          <span key={tab.key} className={activeCls} aria-current="page">
            {tab.icon ? <><StatsIcon />{tab.label}</> : tab.label}
          </span>
        ) : (
          <Link key={tab.key} href={tab.href} className={inactive}>
            {tab.icon ? <><StatsIcon />{tab.label}</> : tab.label}
          </Link>
        )
      )}
    </nav>
  );
}

function StatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="11" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="10" y="7" width="4" height="12" rx="1" fill="currentColor" />
      <rect x="17" y="3" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}