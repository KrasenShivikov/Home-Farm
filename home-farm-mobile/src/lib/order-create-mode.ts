const creatingOrderIds = new Set<string>();

export function markCreatingOrder(orderId: string) {
  creatingOrderIds.add(orderId);
}

export function isCreatingOrder(orderId: string) {
  return creatingOrderIds.has(orderId);
}

export function clearCreatingOrder(orderId: string) {
  creatingOrderIds.delete(orderId);
}
