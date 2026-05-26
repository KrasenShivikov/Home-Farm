export const ORDER_STATUSES = ["Pending", "Accepted", "Completed", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Accepted: "Приета",
  Cancelled: "Отказана",
  Completed: "Завършена",
  Pending: "Чакаща",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function formatOrderStatus(status: string) {
  return isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;
}
