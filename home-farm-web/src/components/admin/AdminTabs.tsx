import Link from "next/link";
import AppIcon from "@/components/AppIcon";

type AdminTabsProps = {
  active: "crops" | "products" | "orders" | "expences" | "stats";
};

type Tab = {
  key: AdminTabsProps["active"];
  href: string;
  icon: Parameters<typeof AppIcon>[0]["name"];
  label: string;
};

const tabs: Tab[] = [
  { key: "crops", href: "/admin", icon: "sprout", label: "Култури" },
  { key: "products", href: "/admin/products", icon: "package", label: "Продукти" },
  { key: "orders", href: "/admin/orders", icon: "shopping-cart", label: "Поръчки" },
  { key: "expences", href: "/admin/expences", icon: "wallet", label: "Разходи" },
  { key: "stats", href: "/admin/stats", icon: "bar-chart", label: "Статистика" },
];

export default function AdminTabs({ active }: AdminTabsProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-150";
  const inactive = `${base} border-transparent bg-transparent text-slate-500 hover:bg-white/85 hover:text-emerald-800`;
  const activeCls =
    `${base} cursor-default border-slate-200 bg-slate-100 text-slate-950 shadow-sm`;

  return (
    <nav
      className="mb-7 flex w-fit flex-wrap gap-1.5 rounded-full border border-emerald-900/10 bg-white/70 p-1.5 backdrop-blur-md"
      aria-label="Admin navigation"
    >
      {tabs.map((tab) =>
        tab.key === active ? (
          <span key={tab.key} className={activeCls} aria-current="page">
            <AppIcon name={tab.icon} />
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} href={tab.href} className={inactive}>
            <AppIcon name={tab.icon} />
            {tab.label}
          </Link>
        )
      )}
    </nav>
  );
}
