export const ORDER_STATUSES = ["Pending", "Accepted", "Completed", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: "Чакаща",
  Accepted: "Приета",
  Completed: "Завършена",
  Cancelled: "Отказана",
};

export function formatOrderStatus(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}
