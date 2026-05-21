export const ORDER_STATUSES = ["Pending", "Accepted", "Completed", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];