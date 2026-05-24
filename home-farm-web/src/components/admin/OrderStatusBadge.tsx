import { formatOrderStatus } from "@/lib/order-statuses";

type OrderStatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  Accepted: "bg-sky-100 text-sky-900 border-sky-200",
  Completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-900 border-rose-200",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const badgeClassName = statusStyles[status] ?? "bg-slate-100 text-slate-800 border-slate-200";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClassName}`}>{formatOrderStatus(status)}</span>;
}
