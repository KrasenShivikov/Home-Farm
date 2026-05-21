import Link from "next/link";

type AdminTabsProps = {
  active: "crops" | "products" | "orders";
};

const tabs = [
  { key: "crops", href: "/admin", label: "Култури" },
  { key: "products", href: "/admin/products", label: "Продукти" },
  { key: "orders", href: "/admin/orders", label: "Поръчки" },
] as const;

export default function AdminTabs({ active }: AdminTabsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) =>
        tab.key === active ? (
          <span key={tab.key} className="btn btn-primary cursor-default opacity-80">
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} href={tab.href} className="btn">
            {tab.label}
          </Link>
        )
      )}
    </div>
  );
}